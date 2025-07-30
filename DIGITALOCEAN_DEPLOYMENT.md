# DigitalOcean Deployment Guide for Assessly

This guide will walk you through deploying your Assessly application on DigitalOcean using Docker and Docker Compose.

## Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **Domain Name**: Optional but recommended for production
3. **Google OAuth Credentials**: For authentication
4. **SSH Key**: For secure server access

## Step 1: Create a DigitalOcean Droplet

1. **Log into DigitalOcean** and click "Create" → "Droplets"

2. **Choose Configuration**:
   - **Distribution**: Ubuntu 22.04 LTS
   - **Plan**: Basic
   - **Size**: 
     - **Minimum**: 2GB RAM, 1 vCPU, 50GB SSD ($12/month)
     - **Recommended**: 4GB RAM, 2 vCPU, 80GB SSD ($24/month)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password

3. **Finalize and Create**:
   - Choose a hostname (e.g., `assessly-production`)
   - Click "Create Droplet"

## Step 2: Connect to Your Droplet

```bash
# Replace YOUR_DROPLET_IP with your actual droplet IP
ssh root@YOUR_DROPLET_IP
```

## Step 3: Server Setup

### Update System
```bash
apt update && apt upgrade -y
```

### Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add current user to docker group
usermod -aG docker $USER

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
exit
```

### Install Additional Tools
```bash
# Install Git, Node.js, and other utilities
apt install -y git curl wget unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js (for potential debugging)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

## Step 4: Clone Your Repository

```bash
# Clone your repository
git clone https://github.com/UTSC-CSCC09-Programming-on-the-Web/project-assessly.git
cd project-assessly

# Make deployment script executable
chmod +x deploy.sh
```

## Step 5: Configure Environment Variables

```bash
# Copy environment template
cp env.example .env

# Edit the environment file
nano .env
```

**Required Configuration**:

```bash
# Database Configuration
DB_NAME=assessly
DB_USERNAME=postgres
DB_PASSWORD=your_very_secure_password_here
DB_HOST=postgres

# OAuth Configuration (Google)
OAUTH_CLIENT_ID=your_google_oauth_client_id
OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
OAUTH_REDIRECT_URL=https://your-domain.com/api/oauth/callback

# Frontend Configuration
VITE_API_BASE_URL=https://your-domain.com

# Node Environment
NODE_ENV=production
```

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set authorized redirect URIs to: `https://your-domain.com/api/oauth/callback`
6. Copy Client ID and Client Secret to your `.env` file

## Step 6: SSL Certificate Setup

### Option A: Let's Encrypt (Recommended for Production)

```bash
# Install Certbot
apt install -y certbot

# Get SSL certificate (replace with your domain)
certbot certonly --standalone -d your-domain.com

# Copy certificates to project directory
mkdir -p ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

### Option B: Self-Signed Certificate (Development/Testing)

```bash
# Generate self-signed certificate
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=CA/ST=Ontario/L=Toronto/O=Assessly/CN=your-domain.com"
```

## Step 7: Deploy the Application

```bash
# Run the deployment script
./deploy.sh
```

The script will:
- Validate environment variables
- Build Docker images
- Start all services
- Check service health

## Step 8: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

## Step 9: Domain Configuration (Optional)

1. **Point your domain** to your droplet's IP address
2. **Add DNS records**:
   - A record: `@` → `YOUR_DROPLET_IP`
   - A record: `www` → `YOUR_DROPLET_IP`

## Step 10: Verify Deployment

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Test health endpoint
curl https://your-domain.com/health
```

## Monitoring and Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres assessly > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres assessly < backup.sql
```

### Scale Services
```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Scale frontend instances
docker-compose up -d --scale frontend=2
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :80
   
   # Stop conflicting services
   systemctl stop apache2 nginx
   ```

2. **Database Connection Issues**:
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test database connection
   docker-compose exec postgres psql -U postgres -d assessly
   ```

3. **SSL Certificate Issues**:
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/cert.pem -text -noout
   
   # Renew Let's Encrypt certificate
   certbot renew
   ```

4. **Memory Issues**:
   ```bash
   # Check memory usage
   free -h
   
   # Check Docker resource usage
   docker stats
   ```

### Performance Optimization

1. **Enable Swap** (if needed):
   ```bash
   # Create swap file
   fallocate -l 2G /swapfile
   chmod 600 /swapfile
   mkswap /swapfile
   swapon /swapfile
   
   # Make permanent
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   ```

2. **Optimize Docker**:
   ```bash
   # Clean up unused images
   docker system prune -a
   
   # Monitor resource usage
   docker stats
   ```

## Security Considerations

1. **Regular Updates**: Keep your droplet and Docker images updated
2. **Firewall**: Only allow necessary ports
3. **SSL**: Always use HTTPS in production
4. **Backups**: Regularly backup your database
5. **Monitoring**: Set up monitoring and alerting
6. **Secrets**: Never commit sensitive data to version control

## Cost Optimization

1. **Right-size your droplet** based on actual usage
2. **Use DigitalOcean's monitoring** to track resource usage
3. **Consider reserved instances** for long-term deployments
4. **Optimize Docker images** to reduce storage costs

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Check DigitalOcean's status page
4. Review this documentation
5. Contact your team or instructor

---

**Note**: This deployment setup is optimized for the C09 project requirements. For production use, consider additional security measures, monitoring, and backup strategies. 