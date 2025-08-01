#!/bin/bash

# Fixed deployment script for Assessly project
# Handles Docker installation conflicts properly

set -e

# Configuration
VM_IP="146.190.246.165"
VM_USER="root"
SSH_KEY="~/.ssh/id_ed25519"

echo "🚀 Starting fixed deployment to VM at $VM_IP..."

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

# Function to setup VM with proper Docker installation
setup_vm() {
    echo "🔧 Setting up VM with proper Docker installation..."
    
    # Update system
    ssh -i $SSH_KEY $VM_USER@$VM_IP "apt update && apt upgrade -y"
    
    # Remove conflicting packages
    echo "🧹 Removing conflicting packages..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "apt remove -y containerd docker.io docker-compose || true"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "apt autoremove -y"
    
    # Install Docker using the official script
    echo "🐳 Installing Docker..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    
    # Install Docker Compose
    echo "📦 Installing Docker Compose..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "chmod +x /usr/local/bin/docker-compose"
    
    # Start and enable Docker
    ssh -i $SSH_KEY $VM_USER@$VM_IP "systemctl start docker && systemctl enable docker"
    
    echo "✅ VM setup complete"
}

# Function to deploy using Docker Compose
deploy_docker() {
    echo "🐳 Deploying with Docker Compose..."
    
    # Create project directory on VM
    ssh -i $SSH_KEY $VM_USER@$VM_IP "mkdir -p /opt/project-assessly"
    
    # Copy project files
    echo "📁 Copying project files..."
    scp -i $SSH_KEY -r . $VM_USER@$VM_IP:/opt/project-assessly/
    
    # Navigate to project directory and deploy
    echo "🏗️ Building and starting containers..."
    ssh -i $SSH_KEY $VM_USER@$VM_IP "cd /opt/project-assessly && docker-compose down || true"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "cd /opt/project-assessly && docker-compose build --no-cache"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "cd /opt/project-assessly && docker-compose up -d"
    
    echo "✅ Docker deployment complete"
}

# Function to check deployment
check_deployment() {
    echo "🔍 Checking deployment status..."
    
    # Check if containers are running
    echo "📊 Container status:"
    ssh -i $SSH_KEY $VM_USER@$VM_IP "docker ps"
    
    # Check if application is accessible
    echo "🌐 Testing application..."
    sleep 15  # Wait for containers to start
    if curl -s http://$VM_IP | grep -q "Assessly\|Vue\|Assessment\|html"; then
        echo "✅ Application is accessible at http://$VM_IP"
    else
        echo "⚠️ Application might not be fully accessible yet"
        echo "Check container logs with: ssh $VM_USER@$VM_IP 'cd /opt/project-assessly && docker-compose logs'"
    fi
    
    echo "✅ Deployment check complete"
}

# Function to show useful commands
show_commands() {
    echo "📋 Useful commands:"
    echo "  View logs: ssh $VM_USER@$VM_IP 'cd /opt/project-assessly && docker-compose logs -f'"
    echo "  Stop services: ssh $VM_USER@$VM_IP 'cd /opt/project-assessly && docker-compose down'"
    echo "  Restart services: ssh $VM_USER@$VM_IP 'cd /opt/project-assessly && docker-compose restart'"
    echo "  View containers: ssh $VM_USER@$VM_IP 'docker ps'"
    echo "  Access application: http://$VM_IP"
}

# Main deployment process
main() {
    echo "🎯 Starting fixed deployment process..."
    
    # Check SSH connection first
    if ! check_ssh_connection; then
        echo "❌ Cannot proceed without SSH connection"
        exit 1
    fi
    
    # Run deployment steps
    setup_vm
    deploy_docker
    check_deployment
    show_commands
    
    echo "🎉 Fixed deployment completed successfully!"
    echo "🌐 Your application should be accessible at: http://$VM_IP"
    echo "📝 Don't forget to:"
    echo "   1. Update the backend/.env file with your actual API keys"
    echo "   2. Configure your Google OAuth credentials"
    echo "   3. Set up your Google AI API key"
}

# Run main function
main "$@" 