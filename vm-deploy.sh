#!/bin/bash

# Course VM Deployment Script for Assessly
# This script is specifically designed for the course-provided VM

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

print_step "Starting Assessly deployment on Course VM..."

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f env.example ]; then
        cp env.example .env
        print_warning "Please edit .env file with your actual configuration values"
        print_warning "Then run this script again"
        print_status "You can edit it with: nano .env"
        exit 1
    else
        print_error "env.example file not found. Please create a .env file manually"
        exit 1
    fi
fi

# Load environment variables
print_status "Loading environment variables..."
source .env

# Validate required environment variables
required_vars=("DB_PASSWORD" "OAUTH_CLIENT_ID" "OAUTH_CLIENT_SECRET" "OAUTH_REDIRECT_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "your_google_oauth_client_id" ] || [ "${!var}" = "your_google_oauth_client_secret" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "The following environment variables need to be configured:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    print_warning "Please edit .env file and set these values"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    print_status "Run: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    print_status "Run: curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

# Create SSL directory if it doesn't exist
if [ ! -d "ssl" ]; then
    print_status "Creating SSL directory..."
    mkdir -p ssl
fi

# Generate self-signed SSL certificate if it doesn't exist
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    print_warning "SSL certificates not found. Generating self-signed certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=CA/ST=Ontario/L=Toronto/O=Assessly/CN=146.190.246.165"
    print_status "SSL certificates generated successfully"
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Clean up any existing images to ensure fresh build
print_status "Cleaning up existing images..."
docker system prune -f

# Build and start containers
print_status "Building and starting containers..."
docker-compose up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 45

# Check if services are running
print_status "Checking service status..."
if docker-compose ps | grep -q "Up"; then
    print_status "All services are running successfully!"
else
    print_error "Some services failed to start. Check logs with: docker-compose logs"
    docker-compose logs --tail=20
    exit 1
fi

# Show service status
print_status "Service status:"
docker-compose ps

# Test health endpoint
print_status "Testing health endpoint..."
sleep 10
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status "Health check passed!"
else
    print_warning "Health check failed. Services might still be starting up."
fi

# Show recent logs
print_status "Recent logs:"
docker-compose logs --tail=10

print_status "Deployment completed successfully!"
echo ""
print_status "Your application is now available at:"
echo "  Frontend: http://146.190.246.165"
echo "  Health Check: http://146.190.246.165/health"
echo "  API: http://146.190.246.165/api/"
echo ""

# Show useful commands
print_status "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  Update application: git pull && docker-compose up -d --build"
echo "  Check resource usage: docker stats"
echo ""

# Check if firewall needs to be configured
print_warning "Don't forget to configure firewall:"
echo "  ufw allow ssh"
echo "  ufw allow 80"
echo "  ufw allow 443"
echo "  ufw enable"
echo ""

print_status "Deployment script completed!" 