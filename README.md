# 🤖 Sunmi AI Agent - Customer Support Chatbot

A professional AI-powered customer support chatbot for Sunmi device management, built with Node.js, Express, and Google Gemini AI.

## ✨ Features

- **🤖 Intelligent AI Chat**: Powered by Google Gemini 1.5 Flash
- **📱 Device Management**: Real-time device status, location, and app monitoring
- **🌐 Beautiful Web Interface**: Responsive design with real-time chat
- **🔒 Secure API**: HMAC-SHA256 authentication with Sunmi OpenAPI
- **📊 System Monitoring**: Built-in diagnostic and health checking
- **🚀 Production Ready**: Optimized for deployment and scaling

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │───▶│  Express Server │───▶│   Sunmi API     │
│  (Chat UI)      │    │  (Node.js)      │    │  (Device Data)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Gemini AI     │
                       │ (Intelligence)  │
                       └─────────────────┘
```

## 🚀 Production Deployment

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Sunmi API Credentials** (AppId & AppKey)
- **Google Gemini API Key**
- **VAS Access** from Sunmi (for device management)

### 1. Environment Setup

Create `config.env` file:

```env
# Sunmi API Configuration
SUNMI_API_BASE_URL=https://openapi.sunmi.com
SUNMI_APP_ID=your_app_id_here
SUNMI_APP_KEY=your_app_key_here

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=production

# Logging Configuration
LOG_LEVEL=info

# Rate Limiting
API_RATE_LIMIT=100
API_RATE_WINDOW=15
```

### 2. Installation

```bash
# Clone and install dependencies
git clone <your-repo>
cd SunmiAgent
npm install

# Start production server
npm start
```

### 3. Production Deployment Options

#### Option A: Traditional Server (VPS/Dedicated)

```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name "sunmi-agent"
pm2 startup
pm2 save

# Setup reverse proxy (nginx)
sudo apt install nginx
# Configure nginx to proxy to port 3000
```

#### Option B: Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run
docker build -t sunmi-agent .
docker run -d -p 3000:3000 --env-file config.env sunmi-agent
```

#### Option C: Cloud Deployment

**Heroku:**
```bash
heroku create your-sunmi-agent
heroku config:set GEMINI_API_KEY=your_key
heroku config:set SUNMI_APP_ID=your_id
heroku config:set SUNMI_APP_KEY=your_key
git push heroku main
```

**AWS/GCP/Azure:**
- Deploy as containerized service
- Use environment variables for configuration
- Setup load balancer and auto-scaling

### 4. Production Configuration

#### Security Headers
The app includes security headers via Helmet.js:
- Content Security Policy
- HTTPS enforcement
- XSS protection
- CSRF protection

#### Monitoring & Logging
- Winston logging with configurable levels
- Request/response logging
- Error tracking
- Performance monitoring

#### Rate Limiting
- Built-in API rate limiting
- Configurable limits per endpoint
- DDoS protection

## 📊 Current Status

### ✅ Production Ready Components

- **🤖 AI Chatbot**: Fully functional with Gemini integration
- **🌐 Web Interface**: Professional, responsive design
- **🔒 Security**: CSP, HTTPS, authentication implemented
- **📝 Logging**: Comprehensive logging system
- **🔧 Monitoring**: Health checks and diagnostics

### ⏳ Pending Components

- **📱 Device Data**: Waiting for VAS access activation from Sunmi
- **🔌 Real-time Updates**: Will activate when API access is granted

## 🎯 Production Checklist

### Before Going Live:

- [ ] **Environment Variables**: All secrets in config.env
- [ ] **HTTPS**: SSL certificate configured
- [ ] **Domain**: Custom domain pointed to server
- [ ] **Monitoring**: Error tracking setup (Sentry, etc.)
- [ ] **Backups**: Database/config backup strategy
- [ ] **Scaling**: Load balancer if needed
- [ ] **VAS Access**: Confirm Sunmi API access is active

### Post-Deployment:

- [ ] **Health Checks**: Monitor `/health` endpoint
- [ ] **Log Monitoring**: Check Winston logs
- [ ] **Performance**: Monitor response times
- [ ] **User Testing**: Test all chat functions
- [ ] **API Limits**: Monitor Gemini usage quotas

## 🔧 API Endpoints

### Public Endpoints
- `GET /` - Web interface
- `POST /api/chat` - Chat with AI
- `GET /health` - Health check

### Admin Endpoints  
- `GET /api/diagnostic` - System diagnostic
- `GET /api/devices` - Device list (requires VAS)
- `GET /api/device/:id` - Device details (requires VAS)

## 🚨 Troubleshooting

### Common Issues

**1. VAS Access Not Working**
```bash
# Check diagnostic
curl http://localhost:3000/api/diagnostic

# Expected: "access forbid" until VAS activates
```

**2. Gemini API Errors**
```bash
# Check API key and quotas
# Monitor logs for rate limiting
```

**3. Chat Not Responding**
```bash
# Check browser console for CSP errors
# Verify server logs for errors
```

## 📞 Support

- **Sunmi API Issues**: Contact Sunmi support
- **Gemini API Issues**: Check Google AI Studio
- **Application Issues**: Check server logs

## 🎉 Ready for Production!

Your Sunmi AI Agent is **production-ready** with intelligent customer support capabilities. The system will automatically gain full device management features once VAS access is activated by Sunmi.

**Current Capabilities:**
- ✅ Professional customer support chat
- ✅ Intelligent troubleshooting guidance
- ✅ Beautiful responsive interface
- ✅ Production-grade security and monitoring

**Coming Soon (with VAS access):**
- 📊 Real device status monitoring
- 📍 Live location tracking  
- 📱 Running applications monitoring
- 🌐 Network connectivity status 