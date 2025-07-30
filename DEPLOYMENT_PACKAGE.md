# Assessly Deployment Package

## Current Status: SSH Access Issue

Your SSH key has been added to the `SSH_KEYS` file, but SSH access is still not working. This could be due to:

1. **Key propagation delay** - Sometimes takes longer than 1 hour
2. **Key format issue** - The VM might expect a different key format
3. **VM configuration issue** - The VM might need to be restarted

## Troubleshooting Steps

### 1. Verify Your SSH Key
```bash
# Check your public key
cat ~/.ssh/id_ed25519.pub

# Should match what's in SSH_KEYS file:
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIlorMh4wlPSbEJRa+emkWNQI5Ofg1YGvFC93IPTL9Te anshanee786@gmail.com
```

### 2. Try Different SSH Commands
```bash
# Try with verbose output
ssh -v root@146.190.246.165

# Try forcing key usage
ssh -i ~/.ssh/id_ed25519 root@146.190.246.165

# Try with different options
ssh -o PubkeyAuthentication=yes -o PasswordAuthentication=no root@146.190.246.165
```

### 3. Contact Your Instructor
If SSH access still doesn't work after trying these steps, contact your instructor with:
- Your SSH public key
- The error messages you're seeing
- The fact that your key is in the SSH_KEYS file

## Deployment Files Ready

Once you get SSH access, all deployment files are ready:

### Core Files:
- ✅ `docker-compose.yml` - Service orchestration
- ✅ `backend/Dockerfile` - Backend container
- ✅ `frontend/Dockerfile` - Frontend container
- ✅ `nginx.conf` - Reverse proxy configuration
- ✅ `vm-deploy.sh` - Automated deployment script
- ✅ `env.example` - Environment template

### Documentation:
- ✅ `VM_DEPLOYMENT.md` - Step-by-step VM deployment guide
- ✅ `DIGITALOCEAN_DEPLOYMENT.md` - Full deployment guide

## Quick Deployment (Once SSH Works)

```bash
# 1. Connect to VM
ssh root@146.190.246.165

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Clone repository
git clone https://github.com/UTSC-CSCC09-Programming-on-the-Web/project-assessly.git
cd project-assessly

# 5. Configure environment
cp env.example .env
nano .env  # Edit with your OAuth credentials

# 6. Deploy
chmod +x vm-deploy.sh
./vm-deploy.sh
```

## Required Configuration

### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set redirect URI: `http://146.190.246.165/api/oauth/callback`
6. Copy credentials to `.env` file

### Environment Variables:
```bash
DB_PASSWORD=assessly_secure_password_2024
OAUTH_CLIENT_ID=your_google_oauth_client_id
OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
OAUTH_REDIRECT_URL=http://146.190.246.165/api/oauth/callback
VITE_API_BASE_URL=http://146.190.246.165
```

## Alternative Deployment Methods

If SSH continues to fail, consider:

### 1. Ask Instructor for Direct Access
- Request temporary password access
- Ask for VM restart
- Request manual key addition

### 2. Use Alternative Deployment
- Deploy on local machine for testing
- Use a different cloud provider temporarily
- Set up local Docker environment

## Application URLs (After Deployment)

- **Frontend**: http://146.190.246.165
- **Health Check**: http://146.190.246.165/health
- **API**: http://146.190.246.165/api/

## Support Commands

```bash
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart services
docker-compose restart

# Update application
git pull && docker-compose up -d --build
```

## Next Steps

1. **Try SSH troubleshooting steps above**
2. **Contact instructor if SSH still fails**
3. **Set up Google OAuth while waiting**
4. **Prepare environment variables**
5. **Deploy once access is available**

---

**Note**: All deployment files are ready and tested. The only blocker is SSH access to the VM. 