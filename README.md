# 🤖 Sunmi AI Agent - Customer Support Chatbot

[![GitHub Repository](https://img.shields.io/badge/GitHub-sunmibot-blue?logo=github)](https://github.com/kennteohstorehub/sunmibot)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/kennteohstorehub/sunmibot)

A professional AI-powered customer support chatbot for Sunmi device management, built with Node.js, Express, and Google Gemini AI.

## 🌟 **Repository**

🔗 **GitHub**: [https://github.com/kennteohstorehub/sunmibot.git](https://github.com/kennteohstorehub/sunmibot.git)

## ✨ Features

### 🤖 AI-Powered Customer Support
- **Google Gemini 2.5 Pro Integration**: Advanced conversational AI with context awareness
- **Intelligent Device Troubleshooting**: Automated problem diagnosis and solutions
- **Multi-language Support**: Communicate in multiple languages
- **Personality Customization**: Switch between casual, technical, and empathetic modes
- **Structured Status Reporting**: Summary-first responses with detailed bullet points
- **Quick Action Buttons**: One-click access to common queries (status, location, apps, troubleshooting)

### 📱 Comprehensive Device Management
- **Real-time Device Monitoring**: Live status, location, and network information
- **Device Health Analytics**: Automated health checks and performance monitoring
- **Multi-device Support**: Manage multiple Sunmi devices from a single interface
- **Historical Data Tracking**: Track device performance over time

### 🔧 Remote APK Management
- **APK File Upload**: Drag-and-drop APK installation with 100MB file support
- **URL-based Installation**: Install apps directly from download URLs
- **App Management**: Update, uninstall, and manage installed applications
- **Package Validation**: Automatic APK validation and security checks

### 💬 Device Communication
- **Direct Messaging**: Send text messages directly to devices
- **Push Notifications**: Send priority notifications with custom titles and content
- **Remote Commands**: Execute system commands (reboot, screenshot, cache clear, etc.)
- **Message History**: Track all communications with devices

### 🌐 Modern Web Interface
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Chat**: Instant messaging with typing indicators
- **File Upload Interface**: Intuitive drag-and-drop APK installation
- **Operation Results**: Real-time feedback on all operations

### 🔒 Enterprise Security
- **HMAC-SHA256 Authentication**: Secure API communication with Sunmi services
- **Environment-based Configuration**: Secure credential management
- **Request Validation**: Input sanitization and validation
- **Error Handling**: Comprehensive error logging and user feedback

### 🚀 Production Ready
- **Docker Support**: Containerized deployment with docker-compose
- **PM2 Integration**: Process management with auto-restart and clustering
- **Health Monitoring**: Built-in health checks and status monitoring
- **Logging**: Structured logging with Winston
- **Auto-deployment**: One-command deployment scripts

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

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- Sunmi Developer Account with API credentials
- Google Gemini API key

### **Installation**

```bash
# Clone the repository
git clone https://github.com/kennteohstorehub/sunmibot.git
cd sunmibot

# Install dependencies
npm install

# Copy environment template
cp config.env.example config.env

# Edit config.env with your API keys
nano config.env

# Start development server
npm run dev
```

### **Environment Configuration**

Create `config.env` with your credentials:

```env
# Sunmi API Configuration
SUNMI_API_BASE_URL=https://openapi.sunmi.com
SUNMI_APP_ID=your_sunmi_app_id_here
SUNMI_APP_KEY=your_sunmi_app_key_here

# AI Service Configuration  
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
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
git clone https://github.com/kennteohstorehub/sunmibot.git
cd sunmibot
npm install

# Start production server
npm start
```

### 3. Production Deployment Options

#### Option A: PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
npm run pm2:start

# Setup auto-restart on system reboot
pm2 startup
pm2 save
```

#### Option B: Docker Deployment

```bash
# Build and run with Docker
npm run docker:build
npm run docker:run

# Or use docker-compose
docker-compose up -d
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

## 🔧 **Available Commands**

```bash
# Development
npm run dev              # Start development server with nodemon
npm run test            # Run API tests

# Production
npm start               # Start production server
npm run pm2:start       # Start with PM2 process manager
npm run pm2:stop        # Stop PM2 process
npm run pm2:restart     # Restart PM2 process

# Docker
npm run docker:build    # Build Docker image
npm run docker:run      # Run Docker container
npm run docker:stop     # Stop Docker container

# Utilities
npm run check:vas       # Check Sunmi VAS access status
npm run check:sunmi     # Same as above
npm run diagnostic      # Run system diagnostic
npm run health          # Check application health

# AI Personality
npm run personality             # List available personalities
npm run personality:casual     # Set casual personality
npm run personality:technical  # Set technical personality
npm run personality:empathetic # Set empathetic personality
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /` - Web interface and documentation
- `POST /api/chat` - Chat with AI assistant
- `GET /api/health` - Health check
- `GET /api/system-status` - Comprehensive system status with formatted response

### Device Management
- `GET /api/devices` - List all available devices
- `GET /api/device/:deviceId` - Get comprehensive device information
- `GET /api/device/:deviceId/status` - Get device status
- `GET /api/device/:deviceId/location` - Get device location
- `GET /api/device/:deviceId/apps` - Get installed apps

### APK Installation & Management
- `POST /api/device/:deviceId/install-app` - Install APK file or from URL
  - **File Upload**: Send APK file as `multipart/form-data` with `apk` field
  - **URL Install**: Send JSON with `appUrl`, `appName` fields
- `POST /api/device/:deviceId/uninstall-app` - Uninstall app by package name
- `POST /api/device/:deviceId/update-app` - Update existing app

### Device Communication
- `POST /api/device/:deviceId/send-message` - Send text message to device
- `POST /api/device/:deviceId/send-notification` - Send push notification
- `POST /api/device/:deviceId/send-command` - Execute remote command
- `GET /api/device/:deviceId/message-history` - Get message history

### Admin Endpoints  
- `GET /api/diagnostic` - System diagnostic

## 🚨 Troubleshooting

### Common Issues

**1. VAS Access Not Working (Error 30000)**
```bash
# Check VAS status
npm run check:vas

# Contact Sunmi support with your App ID
# See SUNMI_ERROR_30000_SOLUTION.md for detailed guide
```

**2. Gemini API Issues**
```bash
# Check API key in config.env
# Verify quota limits in Google Cloud Console
```

**3. Port Already in Use**
```bash
# Change port in config.env
PORT=3001

# Or kill existing process
lsof -ti:3000 | xargs kill
```

## 📚 **Documentation**

- **[Setup Guide](SETUP_GUIDE.md)** - Detailed setup instructions
- **[Production Guide](PRODUCTION.md)** - Production deployment guide
- **[Sunmi Error 30000 Solution](SUNMI_ERROR_30000_SOLUTION.md)** - VAS access troubleshooting
- **[Gemini Setup](GEMINI_SETUP.md)** - AI configuration guide

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Sunmi** for device management APIs
- **Google** for Gemini AI integration
- **Node.js** community for excellent packages
- **Express.js** for the robust web framework

---

**🎉 Ready for Production!** Your Sunmi AI Agent is fully functional and ready to provide excellent customer support. Once VAS access is activated, it will automatically switch to real device data.

For support or questions, please open an issue on [GitHub](https://github.com/kennteohstorehub/sunmibot/issues).