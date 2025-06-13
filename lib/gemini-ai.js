const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAI {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // System prompt for Sunmi customer support - CUSTOMIZE THIS TO CHANGE AI PERSONALITY
        this.systemPrompt = `You are an expert customer support AI for Sunmi device management with a friendly, professional personality.

PERSONALITY & TONE:
- Be warm, approachable, and genuinely helpful
- Use a conversational but professional tone
- Show empathy when customers are frustrated
- Be confident in your technical knowledge
- Use emojis sparingly but effectively (1-2 per response)
- Keep responses concise but thorough

RESPONSE STYLE:
- Start with a friendly greeting or acknowledgment
- Use bullet points and clear formatting for complex information
- Always end with a helpful next step or offer for further assistance
- Use "I'll help you with that" instead of "I can help you with that"
- Address customers by acknowledging their specific situation

TECHNICAL EXPERTISE:
You help customers with:
1. Device Status Monitoring: Check if devices are online/offline, healthy, and functioning properly
2. Location & Network Information: Provide device location, IP addresses, and network details
3. Application Management: Monitor installed apps, running processes, and app-related issues
4. Device Troubleshooting: Help diagnose and resolve device problems
5. Technical Support: Guide customers through device setup, configuration, and maintenance

COMMUNICATION GUIDELINES:
- Always acknowledge the customer's specific device or issue
- Provide clear, actionable steps
- Explain technical concepts in simple terms
- Offer multiple solutions when possible
- Be proactive in suggesting preventive measures

When customers ask about devices, you can access real-time data from the Sunmi API including:
- Device online/offline status
- Device location and network information
- Installed and running applications
- Device health metrics
- Error logs and diagnostic information

Remember: You're not just providing information - you're solving problems and making customers feel supported.`;
    }

    async generateResponse(userMessage, deviceContext = null) {
        try {
            let contextInfo = '';
            
            if (deviceContext) {
                contextInfo = `\n\nCurrent Device Context:\n${JSON.stringify(deviceContext, null, 2)}`;
            }
            
            const prompt = `${this.systemPrompt}\n\nUser Message: ${userMessage}${contextInfo}\n\nPlease provide a helpful response:`;
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return {
                success: true,
                response: text,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            // Provide intelligent fallback responses based on user intent
            const fallbackResponse = this.generateFallbackResponse(userMessage, deviceContext);
            
            return {
                success: false,
                error: error.message,
                response: fallbackResponse,
                timestamp: new Date().toISOString(),
                fallback: true
            };
        }
    }

    generateFallbackResponse(userMessage, deviceContext = null) {
        const intent = this.determineIntent(userMessage);
        const lowerMessage = userMessage.toLowerCase();
        
        // Extract device ID if mentioned
        const deviceIdMatch = userMessage.match(/device\s+([a-zA-Z0-9_-]+)/i) || 
                             userMessage.match(/([a-zA-Z0-9_-]+)/);
        const deviceId = deviceIdMatch ? deviceIdMatch[1] : null;
        
        switch (intent) {
            case 'device_status':
                return `🔍 **Device Status Check**\n\n` +
                       `I'd be happy to help you check your device status${deviceId ? ` for device ${deviceId}` : ''}.\n\n` +
                       `**Current Status:** Due to high demand, I'm operating in simplified mode, but I can still help!\n\n` +
                       `**Quick Steps:**\n` +
                       `1. Check if your device is powered on and connected to internet\n` +
                       `2. Verify the device LED indicators (green = online, red = offline)\n` +
                       `3. Try restarting the device if it appears offline\n\n` +
                       `**Need Real-time Data?** Please try again in a few minutes when our AI service is less busy.\n\n` +
                       `**Immediate Help:** If this is urgent, please contact Sunmi support directly.`;
                       
            case 'device_location':
                return `📍 **Device Location & Network**\n\n` +
                       `I can help you check device location and network information${deviceId ? ` for device ${deviceId}` : ''}.\n\n` +
                       `**Common Solutions:**\n` +
                       `• Check device settings → Network → Wi-Fi status\n` +
                       `• Verify GPS/location services are enabled\n` +
                       `• Ensure device has internet connectivity\n\n` +
                       `**For detailed location data:** Please try again shortly when our AI service is available.`;
                       
            case 'device_apps':
                return `📱 **Application Management**\n\n` +
                       `I can help with app-related issues${deviceId ? ` on device ${deviceId}` : ''}.\n\n` +
                       `**Common App Issues:**\n` +
                       `• App crashes: Try clearing app cache or restarting device\n` +
                       `• App not responding: Force close and reopen the app\n` +
                       `• Missing apps: Check if apps are hidden or need reinstallation\n\n` +
                       `**For detailed app analysis:** Please try again when our AI service is less busy.`;
                       
            case 'troubleshooting':
                return `🔧 **Device Troubleshooting**\n\n` +
                       `I'm here to help resolve your device issues${deviceId ? ` with device ${deviceId}` : ''}.\n\n` +
                       `**Basic Troubleshooting Steps:**\n` +
                       `1. **Power Cycle:** Turn device off, wait 30 seconds, turn back on\n` +
                       `2. **Network Check:** Verify Wi-Fi connection and internet access\n` +
                       `3. **Software Update:** Check for and install any pending updates\n` +
                       `4. **Factory Reset:** Last resort - backup data first\n\n` +
                       `**Still Having Issues?** Please describe the specific problem and I'll provide more targeted help.`;
                       
            case 'device_health':
                return `💚 **Device Health Check**\n\n` +
                       `Let me help you assess your device health${deviceId ? ` for device ${deviceId}` : ''}.\n\n` +
                       `**Health Indicators to Check:**\n` +
                       `• **Power:** Device turns on and stays powered\n` +
                       `• **Display:** Screen is clear and responsive\n` +
                       `• **Network:** Connected to Wi-Fi with internet access\n` +
                       `• **Performance:** Apps load quickly and run smoothly\n` +
                       `• **Storage:** Adequate free space available\n\n` +
                       `**For detailed diagnostics:** Please try again when our AI service is available.`;
                       
            default:
                return `👋 **Sunmi Customer Support**\n\n` +
                       `Hello! I'm your Sunmi device support assistant. I'm currently operating in simplified mode due to high demand.\n\n` +
                       `**I can help you with:**\n` +
                       `• Device status and connectivity issues\n` +
                       `• Location and network troubleshooting\n` +
                       `• Application management and problems\n` +
                       `• General device health checks\n` +
                       `• Step-by-step troubleshooting guides\n\n` +
                       `**How to get help:**\n` +
                       `1. Tell me your device model and serial number\n` +
                       `2. Describe the specific issue you're experiencing\n` +
                       `3. Let me know what you've already tried\n\n` +
                       `**For advanced AI assistance:** Please try again in a few minutes when our service is less busy.`;
        }
    }

    async handleDeviceQuery(userMessage, sunmiAPI) {
        try {
            // Extract device ID from message if mentioned
            const deviceIdMatch = userMessage.match(/device\s+([a-zA-Z0-9_-]+)/i);
            const deviceId = deviceIdMatch ? deviceIdMatch[1] : null;
            
            let deviceContext = null;
            
            if (deviceId) {
                // Get device information if device ID is mentioned
                const deviceInfo = await sunmiAPI.getDeviceFullInfo(deviceId);
                if (deviceInfo.success) {
                    deviceContext = {
                        deviceId: deviceId,
                        status: deviceInfo.data.status,
                        info: deviceInfo.data.info,
                        location: deviceInfo.data.location,
                        network: deviceInfo.data.network,
                        apps: deviceInfo.data.apps
                    };
                }
            }
            
            return await this.generateResponse(userMessage, deviceContext);
        } catch (error) {
            return {
                success: false,
                error: error.message,
                response: "I'm sorry, I encountered an error while checking device information. Please try again.",
                timestamp: new Date().toISOString()
            };
        }
    }

    async analyzeDeviceHealth(deviceData) {
        try {
            const prompt = `${this.systemPrompt}

Please analyze this device data and provide a health assessment:

${JSON.stringify(deviceData, null, 2)}

Provide:
1. Overall health status
2. Any issues or concerns
3. Recommended actions
4. Performance summary`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return {
                success: true,
                analysis: text,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                analysis: "Unable to analyze device health at this time.",
                timestamp: new Date().toISOString()
            };
        }
    }

    async generateTroubleshootingSteps(issue, deviceContext = null) {
        try {
            let contextInfo = deviceContext ? `\n\nDevice Context:\n${JSON.stringify(deviceContext, null, 2)}` : '';
            
            const prompt = `${this.systemPrompt}

A customer is experiencing this issue: ${issue}${contextInfo}

Please provide detailed troubleshooting steps in a clear, numbered format. Include:
1. Initial diagnosis questions
2. Step-by-step resolution guide
3. Alternative solutions if the first approach doesn't work
4. When to escalate to technical support`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return {
                success: true,
                troubleshooting: text,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                troubleshooting: "Unable to generate troubleshooting steps at this time.",
                timestamp: new Date().toISOString()
            };
        }
    }

    // Utility method to determine intent from user message
    determineIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('status') || lowerMessage.includes('online') || lowerMessage.includes('offline')) {
            return 'device_status';
        } else if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('ip')) {
            return 'device_location';
        } else if (lowerMessage.includes('app') || lowerMessage.includes('application') || lowerMessage.includes('software')) {
            return 'device_apps';
        } else if (lowerMessage.includes('troubleshoot') || lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('help')) {
            return 'troubleshooting';
        } else if (lowerMessage.includes('health') || lowerMessage.includes('diagnostic') || lowerMessage.includes('report')) {
            return 'device_health';
        } else {
            return 'general_support';
        }
    }
}

module.exports = GeminiAI; 