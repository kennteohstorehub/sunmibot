#!/bin/bash

# Sunmi AI Agent - Production Deployment Script
# Usage: ./deploy.sh [method]
# Methods: pm2, docker, docker-compose

set -e

echo "🚀 Sunmi AI Agent - Production Deployment"
echo "=========================================="

# Check if config.env exists
if [ ! -f "config.env" ]; then
    echo "❌ Error: config.env file not found!"
    echo "Please create config.env with your API keys and configuration."
    exit 1
fi

# Get deployment method
METHOD=${1:-pm2}

case $METHOD in
    "pm2")
        echo "📦 Deploying with PM2..."
        
        # Install dependencies
        echo "Installing dependencies..."
        npm ci --only=production
        
        # Install PM2 globally if not installed
        if ! command -v pm2 &> /dev/null; then
            echo "Installing PM2..."
            npm install -g pm2
        fi
        
        # Stop existing process if running
        pm2 stop sunmi-agent 2>/dev/null || true
        pm2 delete sunmi-agent 2>/dev/null || true
        
        # Start with PM2
        echo "Starting with PM2..."
        pm2 start server.js --name "sunmi-agent" --env production
        
        # Setup PM2 startup
        pm2 startup
        pm2 save
        
        echo "✅ Deployed successfully with PM2!"
        echo "📊 Monitor with: pm2 monit"
        echo "📝 View logs with: pm2 logs sunmi-agent"
        ;;
        
    "docker")
        echo "🐳 Deploying with Docker..."
        
        # Stop and remove existing container
        docker stop sunmi-agent 2>/dev/null || true
        docker rm sunmi-agent 2>/dev/null || true
        
        # Build image
        echo "Building Docker image..."
        docker build -t sunmi-agent .
        
        # Run container
        echo "Starting container..."
        docker run -d \
            --name sunmi-agent \
            --restart unless-stopped \
            -p 3000:3000 \
            --env-file config.env \
            -v $(pwd)/logs:/app/logs \
            sunmi-agent
        
        echo "✅ Deployed successfully with Docker!"
        echo "📊 Monitor with: docker logs -f sunmi-agent"
        echo "🔍 Status with: docker ps"
        ;;
        
    "docker-compose")
        echo "🐳 Deploying with Docker Compose..."
        
        # Stop existing services
        docker-compose down 2>/dev/null || true
        
        # Build and start services
        echo "Building and starting services..."
        docker-compose up -d --build
        
        echo "✅ Deployed successfully with Docker Compose!"
        echo "📊 Monitor with: docker-compose logs -f"
        echo "🔍 Status with: docker-compose ps"
        ;;
        
    *)
        echo "❌ Unknown deployment method: $METHOD"
        echo "Available methods: pm2, docker, docker-compose"
        exit 1
        ;;
esac

# Wait for service to start
echo "⏳ Waiting for service to start..."
sleep 5

# Health check
echo "🔍 Performing health check..."
if curl -f -s http://localhost:3000/health > /dev/null; then
    echo "✅ Health check passed!"
    echo "🌐 Service is running at: http://localhost:3000"
    echo "💬 Chat interface: http://localhost:3000"
    echo "📊 Diagnostic: http://localhost:3000/api/diagnostic"
else
    echo "❌ Health check failed!"
    echo "Please check the logs for errors."
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "Your Sunmi AI Agent is now running in production mode."
echo ""
echo "Next steps:"
echo "1. Configure your domain and SSL certificate"
echo "2. Set up monitoring and alerting"
echo "3. Test the chat interface"
echo "4. Monitor VAS access activation from Sunmi" 