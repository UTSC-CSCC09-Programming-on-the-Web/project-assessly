#!/bin/bash

# Simple deployment script without Docker
# Uses direct installation on the VM

set -e

# Configuration
VM_IP="146.190.246.165"
VM_USER="root"
SSH_KEY="~/.ssh/id_ed25519"
PROJECT_DIR="/opt/project-assessly"

echo "🚀 Starting simple deployment to VM at $VM_IP..."

# Function to check SSH connection
check_ssh_connection() {
    echo "🔍 Checking SSH connection..."
    if ssh -i $SSH_KEY -o ConnectTimeout=10 -o BatchMode=yes $VM_USER@$VM_IP "echo 'SSH connection successful'" 2>/dev/null; then
        echo "✅ SSH connection successful"
        return 0
    else
        echo "❌ SSH connection failed"
        return 1
    fi
}

# Function to setup VM environment
setup_vm() {
    echo "🔧 Setting up VM environment..."
    
    # Update system
    ssh -i $SSH_KEY $VM_USER@$VM_IP "apt update && apt upgrade -y"
    
    # Install required packages
    echo "📦 Installing required packages..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "apt install -y curl wget git nginx postgresql postgresql-contrib"
    
    # Install Node.js
    echo "🟢 Installing Node.js..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "apt-get install -y nodejs"
    
    # Start and enable services
    ssh -i $SSH_KEY $VM_USER@$VM_IP "systemctl start nginx && systemctl enable nginx"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "systemctl start postgresql && systemctl enable postgresql"
    
    echo "✅ VM environment setup complete"
}

# Function to setup database
setup_database() {
    echo "🗄️ Setting up database..."
    
    # Create database and user
    ssh -i $SSH_KEY $VM_USER@$VM_IP "sudo -u postgres psql -c \"CREATE DATABASE assessly;\" 2>/dev/null || true"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "sudo -u postgres psql -c \"CREATE USER assessly_user WITH PASSWORD 'assessly_password';\" 2>/dev/null || true"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE assessly TO assessly_user;\" 2>/dev/null || true"
    
    echo "✅ Database setup complete"
}

# Function to deploy backend
deploy_backend() {
    echo "🔧 Deploying backend..."
    
    # Create backend directory
    ssh -i $SSH_KEY $VM_USER@$VM_IP "mkdir -p $PROJECT_DIR/backend"
    
    # Copy backend files
    echo "📁 Copying backend files..."
    scp -i $SSH_KEY -r backend/* $VM_USER@$VM_IP:$PROJECT_DIR/backend/
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "cd $PROJECT_DIR/backend && npm install"
    
    # Create environment file
    echo "⚙️ Creating backend environment file..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "cat > $PROJECT_DIR/backend/.env << 'EOF'
# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=assessly
DB_USER=assessly_user
DB_PASSWORD=assessly_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Google AI API Key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Server configuration
PORT=3000
NODE_ENV=production
EOF"
    
    echo "✅ Backend deployment complete"
}

# Function to deploy frontend
deploy_frontend() {
    echo "🔧 Deploying frontend..."
    
    # Create frontend directory
    ssh -i $SSH_KEY $VM_USER@$VM_IP "mkdir -p $PROJECT_DIR/frontend"
    
    # Copy frontend files
    echo "📁 Copying frontend files..."
    scp -i $SSH_KEY -r frontend/* $VM_USER@$VM_IP:$PROJECT_DIR/frontend/
    
    # Install dependencies
    echo "📦 Installing frontend dependencies..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "cd $PROJECT_DIR/frontend && npm install"
    
    # Build frontend
    echo "🏗️ Building frontend..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "cd $PROJECT_DIR/frontend && npm run build"
    
    echo "✅ Frontend deployment complete"
}

# Function to setup nginx
setup_nginx() {
    echo "🌐 Setting up nginx..."
    
    # Create nginx configuration
    ssh -i $SSH_KEY $VM_USER@$VM_IP "cat > /etc/nginx/sites-available/assessly << 'EOF'
server {
    listen 80;
    server_name 146.190.246.165;

    # Frontend
    location / {
        root /opt/project-assessly/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF"
    
    # Enable site
    ssh -i $SSH_KEY $VM_USER@$VM_IP "ln -sf /etc/nginx/sites-available/assessly /etc/nginx/sites-enabled/"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "rm -f /etc/nginx/sites-enabled/default"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "nginx -t && systemctl reload nginx"
    
    echo "✅ Nginx setup complete"
}

# Function to create systemd service
create_backend_service() {
    echo "🔧 Creating backend service..."
    
    # Create systemd service file
    ssh -i $SSH_KEY $VM_USER@$VM_IP "cat > /etc/systemd/system/assessly-backend.service << 'EOF'
[Unit]
Description=Assessly Backend
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/project-assessly/backend
ExecStart=/usr/bin/node app.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF"
    
    # Enable and start service
    ssh -i $SSH_KEY $VM_USER@$VM_IP "systemctl daemon-reload"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "systemctl enable assessly-backend"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "systemctl start assessly-backend"
    
    echo "✅ Backend service created"
}

# Function to check deployment
check_deployment() {
    echo "🔍 Checking deployment status..."
    
    # Check if services are running
    echo "📊 Service status:"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "systemctl is-active assessly-backend"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "systemctl is-active nginx"
    
    # Check if application is accessible
    echo "🌐 Testing application..."
    sleep 10
    if curl -s http://$VM_IP | grep -q "Assessly\|Vue\|Assessment\|html"; then
        echo "✅ Application is accessible at http://$VM_IP"
    else
        echo "⚠️ Application might not be fully accessible yet"
        echo "Check logs with: ssh $VM_USER@$VM_IP 'journalctl -u assessly-backend -f'"
    fi
    
    echo "✅ Deployment check complete"
}

# Function to show useful commands
show_commands() {
    echo "📋 Useful commands:"
    echo "  View backend logs: ssh $VM_USER@$VM_IP 'journalctl -u assessly-backend -f'"
    echo "  Restart backend: ssh $VM_USER@$VM_IP 'systemctl restart assessly-backend'"
    echo "  Check nginx: ssh $VM_USER@$VM_IP 'nginx -t && systemctl reload nginx'"
    echo "  View nginx logs: ssh $VM_USER@$VM_IP 'tail -f /var/log/nginx/access.log'"
    echo "  Access application: http://$VM_IP"
}

# Main deployment process
main() {
    echo "🎯 Starting simple deployment process..."
    
    # Check SSH connection first
    if ! check_ssh_connection; then
        echo "❌ Cannot proceed without SSH connection"
        exit 1
    fi
    
    # Run deployment steps
    setup_vm
    setup_database
    deploy_backend
    deploy_frontend
    setup_nginx
    create_backend_service
    check_deployment
    show_commands
    
    echo "🎉 Simple deployment completed successfully!"
    echo "🌐 Your application should be accessible at: http://$VM_IP"
    echo "📝 Don't forget to:"
    echo "   1. Update the backend/.env file with your actual API keys"
    echo "   2. Configure your Google OAuth credentials"
    echo "   3. Set up your Google AI API key"
}

# Run main function
main "$@" 