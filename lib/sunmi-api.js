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
            
            const response = await this.client(config);
            return {
                success: true,
                data: response.data,
                status: response.status
            };
        } catch (error) {
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
        const statusResult = await this.getDeviceStatus(deviceId);
        const infoResult = await this.getDeviceInfo(deviceId);
        
        return {
            deviceId,
            online: statusResult.success,
            healthy: statusResult.success && infoResult.success,
            lastCheck: new Date().toISOString(),
            statusData: statusResult.data,
            infoData: infoResult.data
        };
    }
}

module.exports = SunmiAPI; 