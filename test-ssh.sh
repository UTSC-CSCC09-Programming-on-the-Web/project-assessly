#!/bin/bash

# Simple SSH connection test script

VM_IP="146.190.246.165"
SSH_KEY="~/.ssh/id_ed25519"

echo "🔍 Testing SSH connection to $VM_IP..."

# Test SSH connection
if ssh -i $SSH_KEY -o ConnectTimeout=10 -o BatchMode=yes root@$VM_IP "echo 'SSH connection successful'" 2>/dev/null; then
    echo "✅ SSH connection successful!"
    echo "🚀 You can now run the deployment script:"
    echo "   ./deploy-docker.sh"
else
    echo "❌ SSH connection failed"
    echo ""
    echo "This could be because:"
    echo "1. SSH keys haven't been updated on the VM yet (can take up to 1 hour)"
    echo "2. VM is not accessible"
    echo "3. SSH key permissions are incorrect"
    echo ""
    echo "To check your SSH key:"
    echo "cat ~/.ssh/id_ed25519.pub"
    echo ""
    echo "To check if it's in SSH_KEYS:"
    echo "grep -f ~/.ssh/id_ed25519.pub SSH_KEYS"
    echo ""
    echo "Try again in a few minutes or contact your instructor."
fi