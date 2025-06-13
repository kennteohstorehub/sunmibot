require('dotenv').config();
const axios = require('axios');

class SunmiAPITester {
    constructor() {
        this.baseURL = process.env.SUNMI_API_BASE_URL || 'https://openapi.sunmi.com';
        this.appId = process.env.SUNMI_APP_ID || 'e6c17b047dd4431eb57f223d2bb46b46';
        this.appKey = process.env.SUNMI_APP_KEY || '34054fe300234524bbbc2395ed4e74d4';
        
        // Generate timestamp and nonce for Sunmi API
        this.timestamp = Math.floor(Date.now() / 1000).toString();
        this.nonce = Math.random().toString(36).substring(2, 8);
        
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'Sunmi-appid': this.appId,
                'Sunmi-timestamp': this.timestamp,
                'Sunmi-nonce': this.nonce,
            }
        });
    }

    generateSignature(requestBody = '') {
        const crypto = require('crypto');
        const concatenatedString = requestBody + this.appId + this.timestamp + this.nonce;
        const signature = crypto
            .createHmac('sha256', this.appKey)
            .update(concatenatedString)
            .digest('hex');
        return signature;
    }

    async testEndpoint(endpoint, method = 'GET', data = null) {
        console.log(`\n🔍 Testing: ${method} ${endpoint}`);
        console.log('─'.repeat(50));
        
        try {
            const requestBody = data ? JSON.stringify(data) : '';
            const signature = this.generateSignature(requestBody);
            
            const config = {
                method: method.toLowerCase(),
                url: endpoint,
                headers: {
                    ...this.client.defaults.headers,
                    'Sunmi-sign': signature
                }
            };
            
            if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                config.data = data;
            }
            
            const response = await this.client(config);
            
            console.log('✅ Status:', response.status);
            console.log('📄 Response:', JSON.stringify(response.data, null, 2));
            
            return {
                success: true,
                status: response.status,
                data: response.data,
                endpoint: endpoint
            };
        } catch (error) {
            console.log('❌ Error:', error.response?.status || 'Network Error');
            console.log('📄 Error Details:', error.response?.data || error.message);
            
            return {
                success: false,
                status: error.response?.status,
                error: error.response?.data || error.message,
                endpoint: endpoint
            };
        }
    }

    async discoverDeviceEndpoints() {
        console.log('\n🔍 DISCOVERING SUNMI API ENDPOINTS');
        console.log('=' .repeat(50));
        
        const possibleEndpoints = [
            // Sunmi OpenAPI endpoints based on documentation
            '/v2/appstore/appstore/app/list',
            '/v2/appstore/appstore/app/detail',
            '/v2/midplat/device/list',
            '/v2/midplat/device/detail',
            '/v2/midplat/device/status',
            '/v2/midplat/device/info',
            '/v2/midplat/device/location',
            '/v2/midplat/device/apps',
            '/v2/midplat/device/network',
            '/v2/midplat/terminal/list',
            '/v2/midplat/terminal/info',
            '/v2/midplat/terminal/status',
            
            // Alternative patterns
            '/v1/device/list',
            '/v1/device/info',
            '/v1/terminal/list',
            '/api/device/list',
            '/api/terminal/list'
        ];

        const results = [];
        
        for (const endpoint of possibleEndpoints) {
            const result = await this.testEndpoint(endpoint);
            results.push(result);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return results;
    }

    async testAuthentication() {
        console.log('\n🔐 TESTING AUTHENTICATION');
        console.log('=' .repeat(50));
        
        const authEndpoints = [
            '/api/v1/auth',
            '/auth',
            '/api/auth',
            '/api/v1/login',
            '/login',
            '/api/v1/token',
            '/token'
        ];
        
        for (const endpoint of authEndpoints) {
            await this.testEndpoint(endpoint);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    generateReport(results) {
        console.log('\n📊 API DISCOVERY REPORT');
        console.log('=' .repeat(50));
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`✅ Successful requests: ${successful.length}`);
        console.log(`❌ Failed requests: ${failed.length}`);
        
        if (successful.length > 0) {
            console.log('\n✅ Working Endpoints:');
            successful.forEach(result => {
                console.log(`  - ${result.endpoint} (${result.status})`);
            });
        }
        
        if (failed.length > 0) {
            console.log('\n❌ Failed Endpoints:');
            failed.forEach(result => {
                console.log(`  - ${result.endpoint} (${result.status || 'Network Error'})`);
            });
        }
    }
}

async function main() {
    console.log('🚀 Starting Sunmi API Discovery');
    
    const tester = new SunmiAPITester();
    
    // Test authentication first
    await tester.testAuthentication();
    
    // Discover device endpoints
    const results = await tester.discoverDeviceEndpoints();
    
    // Generate report
    tester.generateReport(results);
    
    console.log('\n✨ API Discovery Complete!');
    console.log('Next steps:');
    console.log('1. Review the working endpoints above');
    console.log('2. Check the actual Sunmi API documentation for correct endpoints');
    console.log('3. Update the API credentials in your config file');
    console.log('4. Test specific device queries with real device IDs');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SunmiAPITester; 