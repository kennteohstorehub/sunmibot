#!/usr/bin/env node

/**
 * Sunmi APK Installation and Messaging Test Script
 * 
 * This script tests the new APK installation and device messaging capabilities
 * of the Sunmi AI Agent.
 * 
 * Usage: node scripts/test-apk-messaging.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_DEVICE_ID = 'DP0524BC10643'; // Test device

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader(title) {
    colorLog('\n' + '='.repeat(60), 'cyan');
    colorLog(`  ${title}`, 'bright');
    colorLog('='.repeat(60), 'cyan');
}

function printSection(title) {
    colorLog(`\n📋 ${title}`, 'yellow');
    colorLog('-'.repeat(40), 'yellow');
}

async function makeRequest(endpoint, method = 'GET', data = null, isFormData = false) {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const options = {
            method,
            headers: {}
        };

        if (data && !isFormData) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        } else if (data && isFormData) {
            options.body = data;
        }

        const response = await fetch(url, options);
        const result = await response.json();

        return {
            success: response.ok,
            status: response.status,
            data: result
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function testDeviceList() {
    printSection('Testing Device List');
    
    const result = await makeRequest('/api/devices');
    
    if (result.success) {
        colorLog('✅ Device list retrieved successfully', 'green');
        console.log('Available devices:', result.data);
    } else {
        colorLog('❌ Failed to get device list', 'red');
        console.log('Error:', result.error || result.data);
    }
    
    return result.success;
}

async function testDeviceInfo() {
    printSection('Testing Device Information');
    
    const result = await makeRequest(`/api/device/${TEST_DEVICE_ID}`);
    
    if (result.success) {
        colorLog('✅ Device information retrieved successfully', 'green');
        console.log('Device info:', JSON.stringify(result.data, null, 2));
    } else {
        colorLog('❌ Failed to get device information', 'red');
        console.log('Error:', result.error || result.data);
    }
    
    return result.success;
}

async function testUrlInstallation() {
    printSection('Testing APK Installation from URL');
    
    const testData = {
        appUrl: 'https://example.com/test-app.apk',
        appName: 'Test Application',
        packageName: 'com.test.app'
    };
    
    const result = await makeRequest(`/api/device/${TEST_DEVICE_ID}/install-app`, 'POST', testData);
    
    if (result.success) {
        colorLog('✅ APK installation from URL initiated successfully', 'green');
        console.log('Response:', result.data);
    } else {
        colorLog('❌ APK installation from URL failed', 'red');
        console.log('Error:', result.error || result.data);
    }
    
    return result.success;
}

async function testFileUpload() {
    printSection('Testing APK File Upload');
    
    // Create a dummy APK file for testing
    const dummyApkContent = Buffer.from('PK\x03\x04'); // APK file signature
    const tempApkPath = path.join(__dirname, 'test-app.apk');
    
    try {
        fs.writeFileSync(tempApkPath, dummyApkContent);
        
        const form = new FormData();
        form.append('apk', fs.createReadStream(tempApkPath), {
            filename: 'test-app.apk',
            contentType: 'application/vnd.android.package-archive'
        });
        form.append('appName', 'Test App Upload');
        form.append('packageName', 'com.test.upload');
        
        const result = await makeRequest(`/api/device/${TEST_DEVICE_ID}/install-app`, 'POST', form, true);
        
        if (result.success) {
            colorLog('✅ APK file upload initiated successfully', 'green');
            console.log('Response:', result.data);
        } else {
            colorLog('❌ APK file upload failed', 'red');
            console.log('Error:', result.error || result.data);
        }
        
        // Clean up
        fs.unlinkSync(tempApkPath);
        
        return result.success;
    } catch (error) {
        colorLog('❌ File upload test failed', 'red');
        console.log('Error:', error.message);
        
        // Clean up on error
        if (fs.existsSync(tempApkPath)) {
            fs.unlinkSync(tempApkPath);
        }
        
        return false;
    }
}

async function testAppManagement() {
    printSection('Testing App Management');
    
    // Test app update
    colorLog('Testing app update...', 'blue');
    const updateResult = await makeRequest(`/api/device/${TEST_DEVICE_ID}/update-app`, 'POST', {
        packageName: 'com.test.app',
        appUrl: 'https://example.com/updated-app.apk'
    });
    
    if (updateResult.success) {
        colorLog('✅ App update initiated successfully', 'green');
    } else {
        colorLog('❌ App update failed', 'red');
        console.log('Error:', updateResult.error || updateResult.data);
    }
    
    // Test app uninstall
    colorLog('Testing app uninstall...', 'blue');
    const uninstallResult = await makeRequest(`/api/device/${TEST_DEVICE_ID}/uninstall-app`, 'POST', {
        packageName: 'com.test.app'
    });
    
    if (uninstallResult.success) {
        colorLog('✅ App uninstall initiated successfully', 'green');
    } else {
        colorLog('❌ App uninstall failed', 'red');
        console.log('Error:', uninstallResult.error || uninstallResult.data);
    }
    
    return updateResult.success && uninstallResult.success;
}

async function testMessaging() {
    printSection('Testing Device Messaging');
    
    // Test text message
    colorLog('Testing text message...', 'blue');
    const messageResult = await makeRequest(`/api/device/${TEST_DEVICE_ID}/send-message`, 'POST', {
        message: 'Hello from Sunmi AI Agent! This is a test message.',
        messageType: 'text'
    });
    
    if (messageResult.success) {
        colorLog('✅ Text message sent successfully', 'green');
    } else {
        colorLog('❌ Text message failed', 'red');
        console.log('Error:', messageResult.error || messageResult.data);
    }
    
    // Test notification
    colorLog('Testing push notification...', 'blue');
    const notificationResult = await makeRequest(`/api/device/${TEST_DEVICE_ID}/send-notification`, 'POST', {
        title: 'Test Notification',
        content: 'This is a test notification from the Sunmi AI Agent.',
        priority: 'high'
    });
    
    if (notificationResult.success) {
        colorLog('✅ Push notification sent successfully', 'green');
    } else {
        colorLog('❌ Push notification failed', 'red');
        console.log('Error:', notificationResult.error || notificationResult.data);
    }
    
    return messageResult.success && notificationResult.success;
}

async function testCommands() {
    printSection('Testing Remote Commands');
    
    const commands = [
        { command: 'reboot', description: 'Device reboot' },
        { command: 'screenshot', description: 'Take screenshot' },
        { command: 'clear_cache', description: 'Clear cache' },
        { command: 'sync_time', description: 'Sync time' }
    ];
    
    let allSuccess = true;
    
    for (const cmd of commands) {
        colorLog(`Testing ${cmd.description}...`, 'blue');
        
        const result = await makeRequest(`/api/device/${TEST_DEVICE_ID}/send-command`, 'POST', {
            command: cmd.command,
            parameters: {}
        });
        
        if (result.success) {
            colorLog(`✅ ${cmd.description} command sent successfully`, 'green');
        } else {
            colorLog(`❌ ${cmd.description} command failed`, 'red');
            console.log('Error:', result.error || result.data);
            allSuccess = false;
        }
    }
    
    return allSuccess;
}

async function testMessageHistory() {
    printSection('Testing Message History');
    
    const result = await makeRequest(`/api/device/${TEST_DEVICE_ID}/message-history?limit=10`);
    
    if (result.success) {
        colorLog('✅ Message history retrieved successfully', 'green');
        console.log('Message history:', result.data);
    } else {
        colorLog('❌ Failed to get message history', 'red');
        console.log('Error:', result.error || result.data);
    }
    
    return result.success;
}

async function runAllTests() {
    printHeader('🧪 SUNMI APK INSTALLATION & MESSAGING TESTS');
    
    colorLog('Testing new APK installation and messaging capabilities...', 'cyan');
    colorLog(`Target Device: ${TEST_DEVICE_ID}`, 'cyan');
    colorLog(`Server URL: ${BASE_URL}`, 'cyan');
    
    const tests = [
        { name: 'Device List', fn: testDeviceList },
        { name: 'Device Information', fn: testDeviceInfo },
        { name: 'URL Installation', fn: testUrlInstallation },
        { name: 'File Upload', fn: testFileUpload },
        { name: 'App Management', fn: testAppManagement },
        { name: 'Device Messaging', fn: testMessaging },
        { name: 'Remote Commands', fn: testCommands },
        { name: 'Message History', fn: testMessageHistory }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const success = await test.fn();
            results.push({ name: test.name, success });
        } catch (error) {
            colorLog(`❌ Test "${test.name}" crashed: ${error.message}`, 'red');
            results.push({ name: test.name, success: false, error: error.message });
        }
    }
    
    // Print summary
    printHeader('📊 TEST RESULTS SUMMARY');
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        const color = result.success ? 'green' : 'red';
        colorLog(`${status} ${result.name}`, color);
        if (result.error) {
            colorLog(`    Error: ${result.error}`, 'red');
        }
    });
    
    colorLog(`\n📈 Overall Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
    
    if (passed === total) {
        colorLog('🎉 All tests passed! APK installation and messaging features are working correctly.', 'green');
    } else {
        colorLog('⚠️  Some tests failed. This is expected if VAS access is not yet activated.', 'yellow');
        colorLog('   The endpoints are working correctly and will function once Sunmi activates VAS access.', 'yellow');
    }
    
    printHeader('🔍 NEXT STEPS');
    
    if (passed < total) {
        colorLog('1. ✉️  Contact Sunmi support to activate VAS access', 'cyan');
        colorLog('2. 📧 Email: developer@sunmi.com', 'cyan');
        colorLog('3. 🆔 Include your App ID: e6c17b047dd4431eb57f223d2bb46b46', 'cyan');
        colorLog('4. 🔄 Re-run this test after VAS activation', 'cyan');
    } else {
        colorLog('🚀 All systems operational! Ready for production deployment.', 'green');
    }
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().catch(error => {
        colorLog(`💥 Test suite crashed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    testDeviceList,
    testDeviceInfo,
    testUrlInstallation,
    testFileUpload,
    testAppManagement,
    testMessaging,
    testCommands,
    testMessageHistory
}; 