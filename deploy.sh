#!/bin/bash
# filepath: c:\cscc09\main\project-assessly\deploy.sh

set -e  # Exit on any error

echo "🚀 Starting Assessly Full Stack Deployment..."

# Configuration
REPO_URL="https://github.com/UTSC-CSCC09-Programming-on-the-Web/project-assessly.git"
APP_DIR="/opt/assessly"
DOMAIN="assessly.website"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_error "Don't run this script as root!"
    exit 1
fi

log_step "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

log_step "2. Installing Docker and Docker Compose..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    log_warn "Please log out and back in for Docker permissions to take effect"
fi

if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

log_step "3. Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

log_step "4. Cloning/updating repository..."
if [ -d "$APP_DIR/.git" ]; then
    log_info "Updating existing repository..."
    cd $APP_DIR
    git pull origin main
else
    log_info "Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

log_step "5. Setting up environment files..."
# Copy development .env file if it exists
if [ -f "$HOME/project-assessly/backend/.env" ]; then
    log_info "Copying development .env file..."
    cp "$HOME/project-assessly/backend/.env" "$APP_DIR/backend/.env"
    cp "$HOME/project-assessly/backend/.env" "$APP_DIR/backend/.env.production"
    cp "$HOME/project-assessly/backend/.env" "$APP_DIR/.env"
    # Update production-specific settings
    sed -i 's/DB_HOST=localhost/DB_HOST=postgres/' "$APP_DIR/backend/.env.production"
    sed -i 's|FRONTEND_URL=http://localhost:5173|FRONTEND_URL=http://'"$(curl -s ifconfig.me)"'|' "$APP_DIR/backend/.env.production"
    
    log_info "Environment files created and configured for production"
else
    log_warn "No development .env file found. Creating empty production file..."
    touch "$APP_DIR/backend/.env.production"
    log_warn "Please edit $APP_DIR/backend/.env.production with your values"
    nano "$APP_DIR/backend/.env.production"
fi

log_step "6. Building and starting services..."
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml build --no-cache
docker-compose -f docker-compose.yml up -d

log_step "7. Waiting for services to be ready..."
sleep 60

log_step "8. Checking service health..."
if docker-compose ps | grep -q "Up"; then
    log_info "✅ Deployment successful!"
    log_info "Frontend: http://$DOMAIN"
    log_info "Backend API: http://$DOMAIN/api"
    log_info "Database: localhost:5432"
else
    log_error "❌ Deployment failed! Check logs:"
    docker-compose logs
    exit 1
fi

log_step "9. Setting up SSL (optional)..."
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Installing Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
    
    log_info "Obtaining SSL certificate..."
    sudo certbot --nginx -d $DOMAIN
    
    log_info "Setting up automatic renewal..."
    sudo crontab -l > mycron
    echo "0 12 * * * /usr/bin/certbot renew --quiet" >> mycron
    sudo crontab mycron
    rm mycron
fi

log_step "10. Setting up firewall..."
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw --force enable

log_info "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Update your environment variables in $APP_DIR/backend/.env.production"
echo "3. Set up monitoring and backup scripts"
echo "4. Configure your Stripe webhooks to point to https://$DOMAIN/api/stripe/webhook"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Restart: docker-compose -f docker-compose.prod.yml restart"
echo "  Update: cd $APP_DIR && git pull && docker-compose -f docker-compose.prod.yml up -d --build"
