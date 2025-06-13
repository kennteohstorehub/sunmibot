# Sunmi API Setup Guide

## Prerequisites for API Access

### 1. Developer Account Registration
🔗 **Sunmi Developer Portal**: https://developer.sunmi.com

**Required Information:**
- Company name and business registration
- Contact person details
- Business use case description
- Expected API usage volume
- Device management requirements

### 2. TMS/DMP Platform Access Request

**Contact Sunmi Directly:**
- **Global Support**: 400-6666-509 (24/7 support)
- **Email**: Contact through developer portal
- **Business Inquiry**: Submit through TMS contact form

**Information to Provide:**
- Number of devices to manage
- Device models (V2, V2s, D2, D3 Mini, etc.)
- Geographic location of devices
- Customer support requirements
- Integration timeline

## API Key Generation Process

### Step 1: Account Approval
- Submit developer account application
- Wait for approval (typically 1-3 business days)
- Receive developer portal access

### Step 2: TMS/DMP Service Application
- Apply for TMS (Terminal Management System) access
- Specify required capabilities:
  - Device status monitoring
  - Application management
  - Network information access
  - Remote assistance features

### Step 3: API Credentials Generation
Once approved, you'll receive:
- **API Base URL** (e.g., https://tms.sunmi.com/api)
- **API Key/Token**
- **Authentication credentials**
- **Terminal codes** for your devices

## Authentication Methods

Based on TMS integration documentation:

### Method 1: Password-Based Authentication
```bash
# Password encoding for special characters
# Example: 'Pa$$word' becomes 'Pa%24%24word'
```

### Method 2: Terminal Code Authentication
- 3-digit numerical terminal codes
- Account code + terminal code = Terminal Key
- Used to identify specific devices

## Testing Your API Access

### Step 1: Update Configuration
```bash
# Copy the example config
cp config.env.example .env

# Edit with your actual credentials
vim .env
```

### Step 2: Test Basic Connectivity
```bash
# Run our API discovery script
npm run api-test
```

### Step 3: Verify Device Access
```bash
# Test with a specific device ID
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://tms.sunmi.com/api/v1/devices/YOUR_DEVICE_ID"
```

## Common Issues & Solutions

### Issue 1: Authentication Errors
**Problem**: 401 Unauthorized responses
**Solution**: 
- Check API key format
- Verify URL encoding for special characters
- Ensure proper Authorization header

### Issue 2: Device Not Found
**Problem**: 404 errors for device queries
**Solution**:
- Verify terminal code format
- Check device registration status
- Confirm device is online and connected

### Issue 3: Rate Limiting
**Problem**: 429 Too Many Requests
**Solution**:
- Implement request throttling
- Use appropriate polling intervals
- Cache frequently accessed data

## Next Steps After API Access

1. **Update Project Configuration**
   - Add real API credentials to `.env`
   - Configure proper base URLs
   - Set up authentication headers

2. **Test Core Functionality**
   - Device status queries
   - Application list retrieval
   - Network information access

3. **Implement AI Chatbot Integration**
   - Connect to OpenAI/Claude APIs
   - Build natural language processing
   - Create customer support workflows

## Support Resources

- **TMS Documentation**: https://developer.sunmi.com/docs/en-US/xeghjk491/cmieghjk579
- **Developer Portal**: https://developer.sunmi.com
- **Technical Support**: Available through developer portal
- **Community Forum**: Check developer resources section

## Estimated Timeline

- **Developer Account**: 1-3 business days
- **TMS Access Approval**: 3-7 business days
- **API Testing**: 1-2 days
- **Full Integration**: 1-2 weeks

---

**⚠️ Important Notes:**
- Keep API credentials secure and never commit to version control
- Test thoroughly in sandbox environment before production
- Monitor API usage and respect rate limits
- Have backup authentication methods ready 