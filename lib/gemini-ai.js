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

SYSTEM STATUS FORMATTING (IMPORTANT):
When providing system status, device status, or diagnostic information, ALWAYS use this format:
1. **Start with a brief summary** (2-3 sentences overview)
2. **Follow with detailed bullet points** for each component/aspect
3. **Use clear section headers** with emojis for visual organization
4. **Include status indicators** (✅ Good, ⚠️ Warning, ❌ Error)

Example format:
**📊 System Status Summary**
Overall system is running well with minor connectivity issues detected.

**🔧 Detailed Status:**
• **Server Status:** ✅ Online and responsive
• **API Connection:** ⚠️ Limited access (VAS pending)
• **AI Service:** ✅ Fully operational
• **Device Communication:** ❌ Requires VAS activation

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
                return `**📊 Device Status Summary**\n` +
                       `Device status check initiated${deviceId ? ` for device ${deviceId}` : ''}. Currently operating in simplified mode due to high AI service demand.\n\n` +
                       `**🔧 Status Details:**\n` +
                       `• **Power Status:** ⚠️ Please verify device is powered on\n` +
                       `• **Network Connection:** ⚠️ Check internet connectivity\n` +
                       `• **LED Indicators:** 🔍 Green = online, Red = offline\n` +
                       `• **AI Service:** ⚠️ Limited mode (high demand)\n` +
                       `• **Real-time Data:** ❌ Temporarily unavailable\n\n` +
                       `**🚀 Next Steps:**\n` +
                       `• Try restarting device if appears offline\n` +
                       `• Retry in a few minutes for full AI analysis\n` +
                       `• Contact Sunmi support if urgent`;
                       
            case 'device_location':
                return `**📍 Location & Network Summary**\n` +
                       `Location and network check requested${deviceId ? ` for device ${deviceId}` : ''}. Basic diagnostics available in current mode.\n\n` +
                       `**🌐 Network & Location Status:**\n` +
                       `• **Wi-Fi Connection:** 🔍 Check Settings → Network → Wi-Fi\n` +
                       `• **GPS Services:** 🔍 Verify location services enabled\n` +
                       `• **Internet Access:** ⚠️ Ensure connectivity is active\n` +
                       `• **Location Data:** ❌ Real-time data requires full AI mode\n` +
                       `• **Network Details:** ❌ Detailed analysis pending\n\n` +
                       `**🚀 Next Steps:**\n` +
                       `• Verify device network settings\n` +
                       `• Check GPS/location permissions\n` +
                       `• Retry when AI service is fully available`;
                       
            case 'device_apps':
                return `**📱 Application Status Summary**\n` +
                       `App management assistance requested${deviceId ? ` for device ${deviceId}` : ''}. Basic troubleshooting available in current mode.\n\n` +
                       `**📋 Application Status:**\n` +
                       `• **Running Apps:** 🔍 Check device task manager\n` +
                       `• **App Performance:** ⚠️ Monitor for crashes or freezing\n` +
                       `• **App Updates:** 🔍 Check app store for pending updates\n` +
                       `• **Storage Space:** ⚠️ Ensure adequate free space\n` +
                       `• **Detailed Analysis:** ❌ Requires full AI mode\n\n` +
                       `**🚀 Troubleshooting Steps:**\n` +
                       `• Clear app cache for problematic apps\n` +
                       `• Force close and restart unresponsive apps\n` +
                       `• Check for hidden or disabled apps`;
                       
            case 'troubleshooting':
                return `**🔧 Troubleshooting Summary**\n` +
                       `Device troubleshooting initiated${deviceId ? ` for device ${deviceId}` : ''}. Standard diagnostic procedures available.\n\n` +
                       `**🛠️ Diagnostic Status:**\n` +
                       `• **Power System:** 🔍 Check device power and charging\n` +
                       `• **Network Connectivity:** ⚠️ Verify Wi-Fi and internet access\n` +
                       `• **Software Updates:** 🔍 Check for pending system updates\n` +
                       `• **Hardware Status:** ⚠️ Monitor for physical issues\n` +
                       `• **Advanced Diagnostics:** ❌ Requires full AI analysis\n\n` +
                       `**🚀 Recommended Actions:**\n` +
                       `• Power cycle: Off → Wait 30s → On\n` +
                       `• Verify network settings and connectivity\n` +
                       `• Install any available software updates\n` +
                       `• Describe specific issues for targeted help`;
                       
            case 'device_health':
                return `**💚 Device Health Summary**\n` +
                       `Health assessment requested${deviceId ? ` for device ${deviceId}` : ''}. Basic health indicators available for review.\n\n` +
                       `**🏥 Health Status Indicators:**\n` +
                       `• **Power System:** 🔍 Check device powers on and stays stable\n` +
                       `• **Display Quality:** 🔍 Verify screen clarity and responsiveness\n` +
                       `• **Network Health:** ⚠️ Monitor Wi-Fi and internet connectivity\n` +
                       `• **Performance:** ⚠️ Check app loading speed and responsiveness\n` +
                       `• **Storage Space:** 🔍 Ensure adequate free space available\n` +
                       `• **Detailed Diagnostics:** ❌ Requires full AI analysis\n\n` +
                       `**🚀 Health Check Actions:**\n` +
                       `• Monitor device temperature and performance\n` +
                       `• Check storage usage and clean if needed\n` +
                       `• Verify all core functions are working properly`;
                       
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