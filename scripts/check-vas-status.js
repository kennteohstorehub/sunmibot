#!/usr/bin/env node

// Script to check VAS access status and test Sunmi API endpoints
// Usage: node scripts/check-vas-status.js

const SunmiAPI = require('../lib/sunmi-api');
require('dotenv').config({ path: 'config.env' });

const sunmiAPI = new SunmiAPI(
    process.env.SUNMI_APP_ID,
    process.env.SUNMI_APP_KEY,
    process.env.SUNMI_API_BASE_URL
);

async function checkVASStatus() {
    console.log('🔍 Checking Sunmi API VAS Access Status...\n');
    
    // Test account/permission endpoints
    const accountEndpoints = [
        '/v2/account/info',
        '/v1/account/info', 
        '/account/info',
        '/v2/account/permissions',
        '/v1/account/permissions',
        '/account/permissions',
        '/v2/vas/account/info',
        '/v1/vas/account/info',
        '/vas/account/info',
        '/v2/vas/permissions',
        '/v1/vas/permissions',
        '/vas/permissions'
    ];
    
    console.log('📋 Testing Account/Permission Endpoints:');
    for (const endpoint of accountEndpoints) {
        const result = await sunmiAPI.makeRequest(endpoint, 'GET');
        const status = result.success ? '✅' : '❌';
        const code = result.data?.code || result.status;
        const message = result.data?.msg || result.error?.message || 'Unknown';
        
        console.log(`${status} ${endpoint} - Code: ${code}, Message: ${message}`);
    }
    
    console.log('\n📱 Testing Device Management Endpoints:');
    
    // Test device endpoints with different patterns
    const deviceEndpoints = [
        '/v2/vas/device/list',
        '/v1/vas/device/list',
        '/vas/device/list',
        '/v2/midplat/device/list',
        '/v1/device/list',
        '/device/list'
    ];
    
    for (const endpoint of deviceEndpoints) {
        const result = await sunmiAPI.makeRequest(endpoint, 'GET');
        const status = result.success ? '✅' : '❌';
        const code = result.data?.code || result.status;
        const message = result.data?.msg || result.error?.message || 'Unknown';
        
        console.log(`${status} ${endpoint} - Code: ${code}, Message: ${message}`);
    }
    
    console.log('\n🔐 Testing Authentication Endpoints:');
    
    // Test auth/token endpoints
    const authEndpoints = [
        '/v2/auth/token',
        '/v1/auth/token',
        '/auth/token',
        '/v2/oauth/token',
        '/v1/oauth/token',
        '/oauth/token'
    ];
    
    for (const endpoint of authEndpoints) {
        const result = await sunmiAPI.makeRequest(endpoint, 'POST', {
            grant_type: 'client_credentials',
            client_id: process.env.SUNMI_APP_ID,
            client_secret: process.env.SUNMI_APP_KEY
        });
        const status = result.success ? '✅' : '❌';
        const code = result.data?.code || result.status;
        const message = result.data?.msg || result.error?.message || 'Unknown';
        
        console.log(`${status} ${endpoint} - Code: ${code}, Message: ${message}`);
    }
    
    console.log('\n📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (process.env.SUNMI_APP_ID && process.env.SUNMI_APP_KEY) {
        console.log('✅ API Credentials: Configured');
        console.log(`📱 App ID: ${process.env.SUNMI_APP_ID}`);
        console.log(`🔑 App Key: ${process.env.SUNMI_APP_KEY.substring(0, 8)}...`);
    } else {
        console.log('❌ API Credentials: Missing from config.env');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Contact Sunmi support to verify VAS access activation');
    console.log('2. Request specific VAS API endpoints documentation');
    console.log('3. Verify device registration in Sunmi portal');
    console.log('4. Check if additional permissions are needed');
    
    console.log('\n📞 Sunmi Support Contacts:');
    console.log('• Developer Portal: https://developer.sunmi.com');
    console.log('• Support Email: developer@sunmi.com');
    console.log('• Documentation: https://developer.sunmi.com/docs');
}

// Run the check
checkVASStatus().catch(console.error); 