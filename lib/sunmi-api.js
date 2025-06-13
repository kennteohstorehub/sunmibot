const axios = require('axios');
const crypto = require('crypto');

class SunmiAPI {
    constructor(appId, appKey, baseURL = 'https://openapi.sunmi.com') {
        this.appId = appId;
        this.appKey = appKey;
        this.baseURL = baseURL;
        
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    generateSignature(requestBody = '') {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = Math.random().toString(36).substring(2, 8);
        const concatenatedString = requestBody + this.appId + timestamp + nonce;
        const signature = crypto
            .createHmac('sha256', this.appKey)
            .update(concatenatedString)
            .digest('hex');
        
        return { signature, timestamp, nonce };
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        try {
            const requestBody = data ? JSON.stringify(data) : '';
            const { signature, timestamp, nonce } = this.generateSignature(requestBody);
            
            const config = {
                method: method.toLowerCase(),
                url: endpoint,
                headers: {
                    'Sunmi-appid': this.appId,
                    'Sunmi-timestamp': timestamp,
                    'Sunmi-nonce': nonce,
                    'Sunmi-sign': signature
                }
            };
            
            if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                config.data = data;
            }

            // Log detailed request information for debugging
            console.log('\n🔍 SUNMI API REQUEST DETAILS:');
            console.log('=====================================');
            console.log('📍 Full URL:', `${this.baseURL}${endpoint}`);
            console.log('🔧 Method:', method.toUpperCase());
            console.log('📋 Headers:');
            console.log('  - Content-Type: application/json');
            console.log('  - Sunmi-appid:', this.appId);
            console.log('  - Sunmi-timestamp:', timestamp);
            console.log('  - Sunmi-nonce:', nonce);
            console.log('  - Sunmi-sign:', signature);
            if (data) {
                console.log('📦 POST Data:', JSON.stringify(data, null, 2));
            }
            console.log('=====================================\n');
            
            const response = await this.client(config);
            
            // Log response details
            console.log('✅ SUNMI API RESPONSE:');
            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data, null, 2));
            console.log('=====================================\n');
            
            return {
                success: true,
                data: response.data,
                status: response.status
            };
        } catch (error) {
            // Log error details
            console.log('❌ SUNMI API ERROR:');
            console.log('=====================================');
            console.log('📍 Full URL:', `${this.baseURL}${endpoint}`);
            console.log('🔧 Method:', method.toUpperCase());
            console.log('📋 Headers:');
            console.log('  - Content-Type: application/json');
            console.log('  - Sunmi-appid:', this.appId);
            if (data) {
                console.log('📦 POST Data:', JSON.stringify(data, null, 2));
            }
            console.log('🚨 Error Status:', error.response?.status);
            console.log('🚨 Error Response:', JSON.stringify(error.response?.data, null, 2));
            console.log('🚨 Error Message:', error.message);
            console.log('=====================================\n');
            
            return {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status
            };
        }
    }

    // Try multiple endpoint patterns for device list
    async getDeviceList(params = {}) {
        const endpoints = [
            // VAS (Value Added Services) endpoints
            '/v2/vas/device/list',
            '/v1/vas/device/list',
            '/vas/device/list',
            // Standard endpoints
            '/v2/midplat/device/list',
            '/v1/device/list',
            '/api/device/list',
            '/device/list'
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET', params);
            if (result.success && result.data.code !== 30001 && result.data.code !== 30000) {
                return result;
            }
        }
        
        return {
            success: false,
            error: 'No working device list endpoint found. Your account may not have device management permissions.',
            endpoints_tried: endpoints
        };
    }

    async getDeviceDetail(deviceId) {
        const endpoints = [
            // VAS endpoints
            `/v2/vas/device/detail?device_id=${deviceId}`,
            `/v2/vas/device/detail?deviceId=${deviceId}`,
            `/v2/vas/device/detail?sn=${deviceId}`,
            `/v1/vas/device/detail?device_id=${deviceId}`,
            `/vas/device/detail?device_id=${deviceId}`,
            // Standard endpoints
            `/v2/midplat/device/detail?device_id=${deviceId}`,
            `/v2/midplat/device/detail?deviceId=${deviceId}`,
            `/v2/midplat/device/detail?sn=${deviceId}`,
            `/v1/device/info?device_id=${deviceId}`,
            `/api/device/info?device_id=${deviceId}`
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001 && result.data.code !== 30000) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working device detail endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async getDeviceStatus(deviceId) {
        const endpoints = [
            // VAS endpoints
            `/v2/vas/device/status?device_id=${deviceId}`,
            `/v2/vas/device/status?deviceId=${deviceId}`,
            `/v2/vas/device/status?sn=${deviceId}`,
            `/v1/vas/device/status?device_id=${deviceId}`,
            `/vas/device/status?device_id=${deviceId}`,
            // Standard endpoints
            `/v2/midplat/device/status?device_id=${deviceId}`,
            `/v2/midplat/device/status?deviceId=${deviceId}`,
            `/v2/midplat/device/status?sn=${deviceId}`,
            `/v1/device/status?device_id=${deviceId}`,
            `/api/device/status?device_id=${deviceId}`
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001 && result.data.code !== 30000) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working device status endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async getDeviceInfo(deviceId) {
        const endpoints = [
            // VAS endpoints
            `/v2/vas/device/info?device_id=${deviceId}`,
            `/v2/vas/device/info?deviceId=${deviceId}`,
            `/v2/vas/device/info?sn=${deviceId}`,
            `/v1/vas/device/info?device_id=${deviceId}`,
            `/vas/device/info?device_id=${deviceId}`,
            // Standard endpoints
            `/v2/midplat/device/info?device_id=${deviceId}`,
            `/v2/midplat/device/info?deviceId=${deviceId}`,
            `/v2/midplat/device/info?sn=${deviceId}`,
            `/v1/device/info?device_id=${deviceId}`,
            `/api/device/info?device_id=${deviceId}`
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001 && result.data.code !== 30000) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working device info endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async getDeviceLocation(deviceId) {
        const endpoints = [
            `/v2/midplat/device/location?device_id=${deviceId}`,
            `/v2/midplat/device/location?deviceId=${deviceId}`,
            `/v2/midplat/device/location?sn=${deviceId}`,
            `/v1/device/location?device_id=${deviceId}`,
            `/api/device/location?device_id=${deviceId}`
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working device location endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async getDeviceNetwork(deviceId) {
        const endpoints = [
            `/v2/midplat/device/network?device_id=${deviceId}`,
            `/v2/midplat/device/network?deviceId=${deviceId}`,
            `/v2/midplat/device/network?sn=${deviceId}`,
            `/v1/device/network?device_id=${deviceId}`,
            `/api/device/network?device_id=${deviceId}`
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working device network endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async getDeviceApps(deviceId) {
        const endpoints = [
            `/v2/midplat/device/apps?device_id=${deviceId}`,
            `/v2/midplat/device/apps?deviceId=${deviceId}`,
            `/v2/midplat/device/apps?sn=${deviceId}`,
            `/v1/device/apps?device_id=${deviceId}`,
            `/api/device/apps?device_id=${deviceId}`
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working device apps endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    // APK Installation and App Management Methods
    async installApp(deviceId, appData) {
        const endpoints = [
            '/v2/midplat/device/app/install',
            '/v1/device/app/install',
            '/api/device/app/install'
        ];
        
        const payload = {
            device_id: deviceId,
            ...appData
        };
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'POST', payload);
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working app install endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async installAppFromUrl(deviceId, appUrl, appName = null, packageName = null) {
        const appData = {
            app_url: appUrl,
            app_name: appName || 'Remote App',
            package_name: packageName
        };
        
        return this.installApp(deviceId, appData);
    }

    async installAppFromFile(deviceId, apkBuffer, appName, packageName = null) {
        // For file uploads, we need to use multipart/form-data
        const endpoints = [
            '/v2/midplat/device/app/upload',
            '/v1/device/app/upload',
            '/api/device/app/upload'
        ];
        
        const formData = {
            device_id: deviceId,
            app_name: appName,
            package_name: packageName,
            apk_file: apkBuffer
        };
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequestWithFile(endpoint, formData);
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working app upload endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async uninstallApp(deviceId, packageName) {
        const endpoints = [
            '/v2/midplat/device/app/uninstall',
            '/v1/device/app/uninstall',
            '/api/device/app/uninstall'
        ];
        
        const payload = {
            device_id: deviceId,
            package_name: packageName
        };
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'POST', payload);
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working app uninstall endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async updateApp(deviceId, packageName, appUrl = null) {
        const endpoints = [
            '/v2/midplat/device/app/update',
            '/v1/device/app/update',
            '/api/device/app/update'
        ];
        
        const payload = {
            device_id: deviceId,
            package_name: packageName,
            app_url: appUrl
        };
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'POST', payload);
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working app update endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    // Device Messaging Methods
    async sendMessage(deviceId, message, messageType = 'text') {
        const endpoints = [
            '/v2/midplat/device/message/send',
            '/v1/device/message/send',
            '/api/device/message/send'
        ];
        
        const payload = {
            device_id: deviceId,
            message: message,
            message_type: messageType,
            timestamp: Date.now()
        };
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'POST', payload);
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working message send endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async sendNotification(deviceId, title, content, priority = 'normal') {
        const endpoints = [
            '/v2/midplat/device/notification/push',
            '/v1/device/notification/push',
            '/api/device/notification/push'
        ];
        
        const payload = {
            device_id: deviceId,
            title: title,
            content: content,
            priority: priority,
            timestamp: Date.now()
        };
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'POST', payload);
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working notification push endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async sendCommand(deviceId, command, parameters = {}) {
        const endpoints = [
            '/v2/midplat/device/command/execute',
            '/v1/device/command/execute',
            '/api/device/command/execute'
        ];
        
        const payload = {
            device_id: deviceId,
            command: command,
            parameters: parameters,
            timestamp: Date.now()
        };
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'POST', payload);
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working command execute endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    async getMessageHistory(deviceId, limit = 50) {
        const endpoints = [
            `/v2/midplat/device/message/history?device_id=${deviceId}&limit=${limit}`,
            `/v1/device/message/history?device_id=${deviceId}&limit=${limit}`,
            `/api/device/message/history?device_id=${deviceId}&limit=${limit}`
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working message history endpoint found for device: ${deviceId}`,
            endpoints_tried: endpoints
        };
    }

    // File upload helper method
    async makeRequestWithFile(endpoint, formData) {
        try {
            const timestamp = Date.now();
            const signature = this.generateSignature(JSON.stringify(formData));
            
            const FormData = require('form-data');
            const form = new FormData();
            
            // Add form fields
            Object.keys(formData).forEach(key => {
                if (key === 'apk_file') {
                    form.append(key, formData[key], {
                        filename: 'app.apk',
                        contentType: 'application/vnd.android.package-archive'
                    });
                } else {
                    form.append(key, formData[key]);
                }
            });
            
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'app-id': this.appId,
                    'timestamp': timestamp.toString(),
                    'signature': signature,
                    ...form.getHeaders()
                },
                body: form
            });

            const data = await response.json();
            
            return {
                success: response.ok,
                data: data,
                status: response.status,
                endpoint: endpoint
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                endpoint: endpoint
            };
        }
    }

    // Terminal Management Methods
    async getTerminalList() {
        const endpoints = [
            '/v2/midplat/terminal/list',
            '/v1/terminal/list',
            '/api/terminal/list',
            '/terminal/list'
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: 'No working terminal list endpoint found.',
            endpoints_tried: endpoints
        };
    }

    async getTerminalInfo(terminalId) {
        const endpoints = [
            `/v2/midplat/terminal/info?terminal_id=${terminalId}`,
            `/v1/terminal/info?terminal_id=${terminalId}`,
            `/api/terminal/info?terminal_id=${terminalId}`
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working terminal info endpoint found for terminal: ${terminalId}`,
            endpoints_tried: endpoints
        };
    }

    async getTerminalStatus(terminalId) {
        const endpoints = [
            `/v2/midplat/terminal/status?terminal_id=${terminalId}`,
            `/v1/terminal/status?terminal_id=${terminalId}`,
            `/api/terminal/status?terminal_id=${terminalId}`
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint, 'GET');
            if (result.success && result.data.code !== 30001) {
                return result;
            }
        }
        
        return {
            success: false,
            error: `No working terminal status endpoint found for terminal: ${terminalId}`,
            endpoints_tried: endpoints
        };
    }

    // App Store Methods
    async getAppList() {
        return this.makeRequest('/v2/appstore/appstore/app/list', 'GET');
    }

    async getAppDetail(appId) {
        return this.makeRequest(`/v2/appstore/appstore/app/detail?app_id=${appId}`, 'GET');
    }

    // Diagnostic method to check account capabilities
    async checkAccountCapabilities() {
        const tests = [
            { name: 'Device List', method: () => this.getDeviceList() },
            { name: 'Terminal List', method: () => this.getTerminalList() },
            { name: 'App List', method: () => this.getAppList() }
        ];
        
        const results = {};
        
        for (const test of tests) {
            try {
                const result = await test.method();
                results[test.name] = {
                    success: result.success,
                    hasData: result.data && result.data.code !== 30001,
                    error: result.error || null,
                    data: result.data
                };
            } catch (error) {
                results[test.name] = {
                    success: false,
                    hasData: false,
                    error: error.message,
                    data: null
                };
            }
        }
        
        return {
            timestamp: new Date().toISOString(),
            capabilities: results,
            recommendation: this.generateRecommendation(results)
        };
    }

    generateRecommendation(results) {
        const hasWorkingEndpoints = Object.values(results).some(r => r.hasData);
        
        if (!hasWorkingEndpoints) {
            return [
                "❌ No working API endpoints found.",
                "🔍 Possible issues:",
                "  • Your account lacks device management permissions",
                "  • No devices are registered to your account",
                "  • Wrong API credentials or account type",
                "  • API documentation may be outdated",
                "📞 Next steps:",
                "  • Contact Sunmi support to verify account permissions",
                "  • Check if you need to register devices first",
                "  • Verify your API credentials and account type"
            ].join('\n');
        }
        
        return "✅ Some API endpoints are working. Check individual results above.";
    }

    // Convenience Methods for Customer Support
    async getDeviceFullInfo(deviceId) {
        try {
            const [status, info, location, network, apps] = await Promise.all([
                this.getDeviceStatus(deviceId),
                this.getDeviceInfo(deviceId),
                this.getDeviceLocation(deviceId),
                this.getDeviceNetwork(deviceId),
                this.getDeviceApps(deviceId)
            ]);

            return {
                success: true,
                deviceId,
                data: {
                    status: status.data,
                    info: info.data,
                    location: location.data,
                    network: network.data,
                    apps: apps.data
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                deviceId
            };
        }
    }

    async checkDeviceHealth(deviceId) {
        const results = {
            deviceId,
            timestamp: new Date().toISOString(),
            tests: []
        };

        // Test device detail
        const detail = await this.getDeviceDetail(deviceId);
        results.tests.push({
            test: 'Device Detail',
            success: detail.success,
            endpoint: detail.endpoints_tried || 'N/A',
            response: detail.data || detail.error
        });

        // Test device status
        const status = await this.getDeviceStatus(deviceId);
        results.tests.push({
            test: 'Device Status',
            success: status.success,
            endpoint: status.endpoints_tried || 'N/A',
            response: status.data || status.error
        });

        // Test device location
        const location = await this.getDeviceLocation(deviceId);
        results.tests.push({
            test: 'Device Location',
            success: location.success,
            endpoint: location.endpoints_tried || 'N/A',
            response: location.data || location.error
        });

        return results;
    }

    // Generate detailed API debugging report for Sunmi developer
    async generateDeveloperReport(deviceId = null) {
        const report = {
            timestamp: new Date().toISOString(),
            appId: this.appId,
            baseURL: this.baseURL,
            testResults: [],
            recommendations: []
        };

        console.log('\n📊 GENERATING SUNMI API DEVELOPER REPORT');
        console.log('==========================================');

        // Test 1: Device List
        console.log('🧪 Testing Device List endpoints...');
        const deviceList = await this.getDeviceList();
        report.testResults.push({
            test: 'Device List',
            success: deviceList.success,
            endpoints_tried: deviceList.endpoints_tried || ['Standard endpoint'],
            response: deviceList.data || deviceList.error,
            error_code: deviceList.data?.code || null
        });

        // Test 2: Account Capabilities
        console.log('🧪 Testing Account Capabilities...');
        const capabilities = await this.checkAccountCapabilities();
        report.testResults.push({
            test: 'Account Capabilities',
            success: capabilities.success,
            response: capabilities.data || capabilities.error
        });

        // Test 3: Device-specific tests (if deviceId provided)
        if (deviceId) {
            console.log(`🧪 Testing Device-specific endpoints for ${deviceId}...`);
            
            const deviceTests = [
                { name: 'Device Detail', method: 'getDeviceDetail' },
                { name: 'Device Status', method: 'getDeviceStatus' },
                { name: 'Device Info', method: 'getDeviceInfo' },
                { name: 'Device Location', method: 'getDeviceLocation' },
                { name: 'Device Network', method: 'getDeviceNetwork' },
                { name: 'Device Apps', method: 'getDeviceApps' }
            ];

            for (const test of deviceTests) {
                try {
                    const result = await this[test.method](deviceId);
                    report.testResults.push({
                        test: test.name,
                        deviceId: deviceId,
                        success: result.success,
                        endpoints_tried: result.endpoints_tried || ['Standard endpoint'],
                        response: result.data || result.error,
                        error_code: result.data?.code || null
                    });
                } catch (error) {
                    report.testResults.push({
                        test: test.name,
                        deviceId: deviceId,
                        success: false,
                        error: error.message
                    });
                }
            }
        }

        // Generate recommendations
        const errorCodes = report.testResults
            .filter(r => r.error_code)
            .map(r => r.error_code);

        if (errorCodes.includes(30000)) {
            report.recommendations.push({
                issue: 'Error Code 30000 - Access Forbidden',
                description: 'VAS (Value Added Services) access is required but not granted',
                solution: 'Contact Sunmi support to enable VAS access for your App ID',
                priority: 'HIGH'
            });
        }

        if (errorCodes.includes(30001)) {
            report.recommendations.push({
                issue: 'Error Code 30001 - Endpoint Not Found',
                description: 'API endpoint does not exist or is not accessible',
                solution: 'Verify API documentation and endpoint availability',
                priority: 'MEDIUM'
            });
        }

        console.log('📋 DEVELOPER REPORT COMPLETE');
        console.log('==========================================\n');

        return report;
    }
}

module.exports = SunmiAPI; 