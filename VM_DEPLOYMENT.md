# Course VM Deployment Guide for Assessly

This guide is specifically designed for deploying Assessly on the course-provided VM at `146.190.246.165`.

## Prerequisites

1. **SSH Access**: Your SSH key must be added to the `SSH_KEYS` file and pushed to GitHub
2. **Wait Time**: SSH key updates take up to 1 hour to propagate to the VM

## Step 1: Verify SSH Access

Once your SSH key is added to the repository, wait up to 1 hour, then test:

```bash
ssh root@146.190.246.165
```

## Step 2: Connect to VM and Setup

```bash
# Connect to your VM
ssh root@146.190.246.165

# Update system
apt update && apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install additional tools
apt install -y git curl wget unzip
```

## Step 3: Clone and Deploy

```bash
# Clone your repository
git clone https://github.com/UTSC-CSCC09-Programming-on-the-Web/project-assessly.git
cd project-assessly

# Create environment file
cp env.example .env
nano .env  # Edit with your configuration
```

## Step 4: Configure Environment Variables

Edit the `.env` file with these values:

```bash
# Database Configuration
DB_NAME=assessly
DB_USERNAME=postgres
DB_PASSWORD=assessly_secure_password_2024
DB_HOST=postgres

# OAuth Configuration (Google)
OAUTH_CLIENT_ID=your_google_oauth_client_id
OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
OAUTH_REDIRECT_URL=http://146.190.246.165/api/oauth/callback

# Frontend Configuration
VITE_API_BASE_URL=http://146.190.246.165

# Node Environment
NODE_ENV=production
```

## Step 5: Generate SSL Certificates

```bash
# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=CA/ST=Ontario/L=Toronto/O=Assessly/CN=146.190.246.165"
```

## Step 6: Deploy Application

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## Step 7: Configure Firewall

```bash
# Allow necessary ports
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

## Step 8: Verify Deployment

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Test health endpoint
curl http://146.190.246.165/health
```

## Access Your Application

- **Frontend**: http://146.190.246.165
- **API Health Check**: http://146.190.246.165/health
- **Backend API**: http://146.190.246.165/api/

## Troubleshooting

### SSH Connection Issues
```bash
# Check if your key is working
ssh -v root@146.190.246.165

# If still having issues, wait longer for key propagation
# or contact your instructor
```

### Docker Issues
```bash
# Check Docker status
systemctl status docker

# Restart Docker if needed
systemctl restart docker
```

### Port Issues
```bash
# Check what's using port 80
netstat -tulpn | grep :80

# Stop conflicting services
systemctl stop apache2 nginx
```

### Memory Issues
```bash
# Check memory usage
free -h

# Create swap if needed
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update application
git pull && docker-compose up -d --build

# Stop all services
docker-compose down

# Check resource usage
docker stats
```

## Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URI to: `http://146.190.246.165/api/oauth/callback`
6. Copy credentials to your `.env` file

## Notes

- The VM has 4GB RAM, 2 vCPUs, and 80GB SSD
- This setup uses HTTP (not HTTPS) for simplicity
- For production, consider setting up proper SSL certificates
- The database data is persisted in Docker volumes
- Regular backups are recommended

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify your `.env` configuration
3. Ensure all required ports are open
4. Contact your instructor if SSH access issues persist 