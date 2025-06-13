require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const SunmiAPI = require('./lib/sunmi-api');
const GeminiAI = require('./lib/gemini-ai');

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

// Device information endpoint
app.get('/api/device/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        logger.info('Device info request', { deviceId });
        
        // Get comprehensive device information
        const deviceInfo = await sunmiAPI.getDeviceFullInfo(deviceId);
        
        if (deviceInfo.success) {
            res.json({
                deviceId,
                success: true,
                data: deviceInfo.data,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(404).json({
                deviceId,
                success: false,
                error: 'Device not found or API error',
                details: deviceInfo.error,
                timestamp: new Date().toISOString()
            });
        }
        
    } catch (error) {
        logger.error('Device endpoint error', error);
        res.status(500).json({
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
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

// List all devices endpoint
app.get('/api/devices', async (req, res) => {
    try {
        logger.info('Device list request');
        
        const devicesResult = await sunmiAPI.getDeviceList();
        
        res.json({
            devices: devicesResult.success ? devicesResult.data : [],
            success: devicesResult.success,
            error: devicesResult.success ? null : devicesResult.error,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        logger.error('Device list endpoint error', error);
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