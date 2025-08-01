#!/bin/bash

# Script to fix deployment issues

set -e

echo "🔧 Fixing deployment issues..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.template .env
    echo "⚠️  Please edit .env file with your actual values before continuing"
    echo "   Required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_AI_API_KEY"
    read -p "Press Enter after editing .env file..."
fi

# Stop current containers
echo "🛑 Stopping current containers..."
docker-compose down

# Remove old volumes to start fresh
echo "🧹 Cleaning up old data..."
docker volume rm project-assessly_postgres_data_prod 2>/dev/null || true

# Rebuild and start with new configuration
echo "🚀 Rebuilding and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check container status
echo "📊 Container status:"
docker-compose ps

# Check logs
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo "✅ Deployment fix complete!"
echo "🌐 Your application should be accessible at: http://localhost"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Check status: docker-compose ps"
echo "  Restart: docker-compose restart" 