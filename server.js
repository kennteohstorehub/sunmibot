require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const SunmiAPI = require('./lib/sunmi-api');
const GeminiAI = require('./lib/gemini-ai');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for APK files
    },
    fileFilter: (req, file, cb) => {
        // Accept APK files and other common app formats
        if (file.mimetype === 'application/vnd.android.package-archive' || 
            file.originalname.toLowerCase().endsWith('.apk')) {
            cb(null, true);
        } else {
            cb(new Error('Only APK files are allowed'), false);
        }
    }
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Sunmi API
const sunmiAPI = new SunmiAPI(
    process.env.SUNMI_APP_ID || 'e6c17b047dd4431eb57f223d2bb46b46',
    process.env.SUNMI_APP_KEY || '34054fe300234524bbbc2395ed4e74d4'
);

// Initialize Gemini AI
const geminiAI = new GeminiAI(process.env.GEMINI_API_KEY);

// Configure logging
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
        },
    },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for the web interface)
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// Routes
app.get('/api', (req, res) => {
    res.json({
        message: 'Sunmi AI Agent - Customer Support Chatbot',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            chat: '/api/chat',
            device: '/api/device',
            health: '/health',
            webInterface: '/'
        }
    });
});

// Root route serves the web interface
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Chat endpoint for AI agent
app.post('/api/chat', async (req, res) => {
    try {
        const { message, deviceId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                error: 'Message is required',
                timestamp: new Date().toISOString()
            });
        }
        
        logger.info('Chat request received', { message, deviceId });
        
        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                response: "🤖 Gemini AI is ready to help! Please add your GEMINI_API_KEY to the environment variables to enable AI responses.",
                requiresSetup: true,
                timestamp: new Date().toISOString(),
                context: { message, deviceId: deviceId || null }
            });
        }
        
        // Use Gemini AI to handle the customer support query
        const aiResponse = await geminiAI.handleDeviceQuery(message, sunmiAPI);
        
        if (aiResponse.success) {
            res.json({
                response: aiResponse.response,
                timestamp: aiResponse.timestamp,
                context: {
                    message,
                    deviceId: deviceId || null,
                    intent: geminiAI.determineIntent(message)
                }
            });
        } else {
            res.status(500).json({
                response: aiResponse.response,
                error: aiResponse.error,
                timestamp: aiResponse.timestamp,
                context: { message, deviceId: deviceId || null }
            });
        }
        
    } catch (error) {
        logger.error('Chat endpoint error', error);
        res.status(500).json({
            error: 'Internal server error',
            response: "I'm sorry, I'm experiencing technical difficulties. Please try again.",
            timestamp: new Date().toISOString()
        });
    }
});

// Device Management Endpoints
app.get('/api/devices', async (req, res) => {
    try {
        logger.info('Device list request');
        const result = await sunmiAPI.getDeviceList();
        
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ 
                error: 'Failed to fetch device list', 
                details: result.error 
            });
        }
    } catch (error) {
        logger.error('Error fetching device list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/device/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params;
        logger.info(`Device info request for: ${deviceId}`);
        
        const result = await sunmiAPI.getDeviceFullInfo(deviceId);
        
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(404).json({ 
                error: 'Device not found or inaccessible', 
                details: result.error 
            });
        }
    } catch (error) {
        logger.error(`Error fetching device info for ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// APK Installation Endpoints
app.post('/api/device/:deviceId/install-app', upload.single('apk'), async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { appName, packageName, appUrl } = req.body;
        
        logger.info(`App installation request for device: ${deviceId}`);
        
        let result;
        
        if (req.file) {
            // Install from uploaded APK file
            result = await sunmiAPI.installAppFromFile(
                deviceId, 
                req.file.buffer, 
                appName || req.file.originalname,
                packageName
            );
        } else if (appUrl) {
            // Install from URL
            result = await sunmiAPI.installAppFromUrl(deviceId, appUrl, appName, packageName);
        } else {
            return res.status(400).json({ 
                error: 'Either APK file or app URL is required' 
            });
        }
        
        if (result.success) {
            res.json({
                success: true,
                message: 'App installation initiated',
                data: result.data
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to install app', 
                details: result.error 
            });
        }
    } catch (error) {
        logger.error(`Error installing app on device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/device/:deviceId/uninstall-app', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { packageName } = req.body;
        
        if (!packageName) {
            return res.status(400).json({ error: 'Package name is required' });
        }
        
        logger.info(`App uninstallation request for device: ${deviceId}, package: ${packageName}`);
        
        const result = await sunmiAPI.uninstallApp(deviceId, packageName);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'App uninstallation initiated',
                data: result.data
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to uninstall app', 
                details: result.error 
            });
        }
    } catch (error) {
        logger.error(`Error uninstalling app on device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/device/:deviceId/update-app', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { packageName, appUrl } = req.body;
        
        if (!packageName) {
            return res.status(400).json({ error: 'Package name is required' });
        }
        
        logger.info(`App update request for device: ${deviceId}, package: ${packageName}`);
        
        const result = await sunmiAPI.updateApp(deviceId, packageName, appUrl);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'App update initiated',
                data: result.data
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to update app', 
                details: result.error 
            });
        }
    } catch (error) {
        logger.error(`Error updating app on device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Device Messaging Endpoints
app.post('/api/device/:deviceId/send-message', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { message, messageType = 'text' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message content is required' });
        }
        
        logger.info(`Message send request for device: ${deviceId}`);
        
        const result = await sunmiAPI.sendMessage(deviceId, message, messageType);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Message sent successfully',
                data: result.data
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send message', 
                details: result.error 
            });
        }
    } catch (error) {
        logger.error(`Error sending message to device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/device/:deviceId/send-notification', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { title, content, priority = 'normal' } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        logger.info(`Notification send request for device: ${deviceId}`);
        
        const result = await sunmiAPI.sendNotification(deviceId, title, content, priority);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Notification sent successfully',
                data: result.data
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send notification', 
                details: result.error 
            });
        }
    } catch (error) {
        logger.error(`Error sending notification to device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/device/:deviceId/send-command', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { command, parameters = {} } = req.body;
        
        if (!command) {
            return res.status(400).json({ error: 'Command is required' });
        }
        
        logger.info(`Command send request for device: ${deviceId}, command: ${command}`);
        
        const result = await sunmiAPI.sendCommand(deviceId, command, parameters);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Command sent successfully',
                data: result.data
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to send command', 
                details: result.error 
            });
        }
    } catch (error) {
        logger.error(`Error sending command to device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/device/:deviceId/message-history', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { limit = 50 } = req.query;
        
        logger.info(`Message history request for device: ${deviceId}`);
        
        const result = await sunmiAPI.getMessageHistory(deviceId, parseInt(limit));
        
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(500).json({ 
                error: 'Failed to fetch message history', 
                details: result.error 
            });
        }
    } catch (error) {
        logger.error(`Error fetching message history for device ${req.params.deviceId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Device status endpoint
app.get('/api/device/:deviceId/status', async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        logger.info('Device status request', { deviceId });
        
        // Get device health check
        const healthCheck = await sunmiAPI.checkDeviceHealth(deviceId);
        
        res.json({
            deviceId,
            online: healthCheck.online,
            healthy: healthCheck.healthy,
            lastCheck: healthCheck.lastCheck,
            status: healthCheck.statusData,
            info: healthCheck.infoData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Device status endpoint error', error);
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// Device location endpoint
app.get('/api/device/:deviceId/location', async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        logger.info('Device location request', { deviceId });
        
        const [locationResult, networkResult] = await Promise.all([
            sunmiAPI.getDeviceLocation(deviceId),
            sunmiAPI.getDeviceNetwork(deviceId)
        ]);
        
        res.json({
            deviceId,
            location: locationResult.success ? locationResult.data : null,
            network: networkResult.success ? networkResult.data : null,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Device location endpoint error', error);
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// Device apps endpoint
app.get('/api/device/:deviceId/apps', async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        logger.info('Device apps request', { deviceId });
        
        const appsResult = await sunmiAPI.getDeviceApps(deviceId);
        
        res.json({
            deviceId,
            apps: appsResult.success ? appsResult.data : null,
            success: appsResult.success,
            error: appsResult.success ? null : appsResult.error,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Device apps endpoint error', error);
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// AI-powered device health analysis
app.post('/api/device/:deviceId/analyze', async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        logger.info('Device analysis request', { deviceId });
        
        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                analysis: "AI analysis requires Gemini API key configuration.",
                requiresSetup: true,
                timestamp: new Date().toISOString()
            });
        }
        
        // Get comprehensive device data
        const deviceInfo = await sunmiAPI.getDeviceFullInfo(deviceId);
        
        if (!deviceInfo.success) {
            return res.status(404).json({
                error: 'Device not found or unavailable',
                deviceId,
                timestamp: new Date().toISOString()
            });
        }
        
        // Use Gemini to analyze device health
        const analysis = await geminiAI.analyzeDeviceHealth(deviceInfo.data);
        
        res.json({
            deviceId,
            analysis: analysis.analysis,
            success: analysis.success,
            deviceData: deviceInfo.data,
            timestamp: analysis.timestamp
        });
        
    } catch (error) {
        logger.error('Device analysis endpoint error', error);
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// AI-powered troubleshooting assistance
app.post('/api/troubleshoot', async (req, res) => {
    try {
        const { issue, deviceId } = req.body;
        
        if (!issue) {
            return res.status(400).json({
                error: 'Issue description is required',
                timestamp: new Date().toISOString()
            });
        }
        
        logger.info('Troubleshooting request', { issue, deviceId });
        
        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                troubleshooting: "AI troubleshooting requires Gemini API key configuration.",
                requiresSetup: true,
                timestamp: new Date().toISOString()
            });
        }
        
        let deviceContext = null;
        
        if (deviceId) {
            const deviceInfo = await sunmiAPI.getDeviceFullInfo(deviceId);
            if (deviceInfo.success) {
                deviceContext = deviceInfo.data;
            }
        }
        
        // Generate troubleshooting steps with Gemini
        const troubleshooting = await geminiAI.generateTroubleshootingSteps(issue, deviceContext);
        
        res.json({
            issue,
            deviceId: deviceId || null,
            troubleshooting: troubleshooting.troubleshooting,
            success: troubleshooting.success,
            timestamp: troubleshooting.timestamp
        });
        
    } catch (error) {
        logger.error('Troubleshooting endpoint error', error);
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// Device diagnostic endpoint
app.get('/api/diagnostic', async (req, res) => {
    try {
        logger.info('API diagnostic request');
        const diagnostic = await sunmiAPI.checkAccountCapabilities();
        
        res.json({
            success: true,
            diagnostic,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error during API diagnostic:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get system status with comprehensive monitoring
app.get('/api/system-status', async (req, res) => {
    logger.info('System status request');
    
    try {
        const status = {
            timestamp: new Date().toISOString(),
            server: {
                status: 'running',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            },
            sunmi: {
                status: 'unknown',
                message: 'Testing connection...'
            },
            ai: {
                status: 'unknown',
                message: 'Testing AI service...'
            },
            security: {
                https: req.secure,
                headers: !!req.headers['x-forwarded-proto']
            }
        };

        // Test Sunmi API
        try {
            const deviceResult = await sunmiAPI.getDeviceList();
            if (deviceResult.success) {
                status.sunmi.status = 'connected';
                status.sunmi.message = 'API connection successful';
                status.sunmi.deviceCount = deviceResult.data?.data?.length || 0;
            } else {
                status.sunmi.status = 'limited';
                status.sunmi.message = 'Limited access - VAS permissions may be required';
                status.sunmi.error = deviceResult.error;
            }
        } catch (error) {
            status.sunmi.status = 'error';
            status.sunmi.message = 'Connection failed';
            status.sunmi.error = error.message;
        }

        // Test Gemini AI
        try {
            const testResponse = await geminiAI.generateResponse('test', null, 'general_support');
            if (testResponse && !testResponse.includes('API key')) {
                status.ai.status = 'ready';
                status.ai.message = 'AI service operational';
            } else {
                status.ai.status = 'setup_required';
                status.ai.message = 'API key configuration needed';
            }
        } catch (error) {
            status.ai.status = 'error';
            status.ai.message = 'AI service unavailable';
            status.ai.error = error.message;
        }

        // Generate summary
        const summary = generateSystemStatusSummary(status);

        res.json({
            success: true,
            status,
            summary
        });

    } catch (error) {
        logger.error('System status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get system status',
            details: error.message
        });
    }
});

// Generate detailed API debugging report for Sunmi developer
app.get('/api/developer-report/:deviceId?', async (req, res) => {
    logger.info('Developer report request', { deviceId: req.params.deviceId });
    
    try {
        const deviceId = req.params.deviceId || null;
        const report = await sunmiAPI.generateDeveloperReport(deviceId);
        
        res.json({
            success: true,
            report,
            note: 'This report contains detailed API call information for Sunmi developer support'
        });

    } catch (error) {
        logger.error('Developer report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate developer report',
            details: error.message
        });
    }
});

// Generate system status summary using AI
function generateSystemStatusSummary(status) {
    const statusCounts = {
        operational: 0,
        online: 0,
        connected: 0,
        active: 0,
        limited: 0,
        error: 0,
        not_applicable: 0
    };
    
    // Count status types
    Object.values(status).forEach(component => {
        statusCounts[component.status] = (statusCounts[component.status] || 0) + 1;
    });
    
    const totalComponents = Object.keys(status).length - statusCounts.not_applicable;
    const healthyComponents = statusCounts.operational + statusCounts.online + statusCounts.connected + statusCounts.active;
    const issueComponents = statusCounts.limited + statusCounts.error;
    
    // Generate summary
    let overallStatus = 'healthy';
    let summaryText = '';
    
    if (issueComponents === 0) {
        overallStatus = 'excellent';
        summaryText = `**📊 System Status Summary**\nAll systems operational and running smoothly. ${healthyComponents}/${totalComponents} components fully functional.`;
    } else if (statusCounts.error > 0) {
        overallStatus = 'degraded';
        summaryText = `**📊 System Status Summary**\nSystem experiencing some issues. ${healthyComponents}/${totalComponents} components healthy, ${issueComponents} requiring attention.`;
    } else {
        overallStatus = 'limited';
        summaryText = `**📊 System Status Summary**\nSystem operational with limited functionality. ${healthyComponents}/${totalComponents} components fully functional, ${statusCounts.limited} in limited mode.`;
    }
    
    // Add detailed status
    summaryText += '\n\n**🔧 Component Status:**\n';
    
    Object.entries(status).forEach(([component, info]) => {
        let icon = '🔍';
        switch (info.status) {
            case 'operational':
            case 'online':
            case 'connected':
            case 'active':
                icon = '✅';
                break;
            case 'limited':
                icon = '⚠️';
                break;
            case 'error':
                icon = '❌';
                break;
            case 'not_applicable':
                icon = '➖';
                break;
        }
        
        const componentName = component.charAt(0).toUpperCase() + component.slice(1).replace(/([A-Z])/g, ' $1');
        summaryText += `• **${componentName}:** ${icon} ${info.message}\n`;
    });
    
    // Add recommendations
    summaryText += '\n**🚀 Recommendations:**\n';
    if (statusCounts.error > 0) {
        summaryText += '• Check error logs and restart affected services\n';
        summaryText += '• Verify network connectivity and API credentials\n';
    }
    if (statusCounts.limited > 0) {
        summaryText += '• Contact Sunmi support to activate VAS access\n';
        summaryText += '• Monitor system for any performance issues\n';
    }
    if (overallStatus === 'excellent') {
        summaryText += '• System running optimally - no action required\n';
        summaryText += '• Continue monitoring for any changes\n';
    }
    
    return summaryText;
}

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Unhandled error', error);
    res.status(500).json({
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Sunmi AI Agent server running on port ${PORT}`);
    logger.info(`📖 API Documentation: http://localhost:${PORT}/`);
    logger.info(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
    logger.info(`🔍 Device endpoint: http://localhost:${PORT}/api/device/:deviceId`);
});

module.exports = app; 