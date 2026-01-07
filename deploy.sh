#!/bin/bash

# ================================================================
# Kawan Hiking - Deployment Script
# ================================================================
# Usage: ./deploy.sh
# ================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="kawan-hiking"
APP_DIR=$(pwd)
NODE_VERSION="18"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Header
echo ""
echo "================================================================"
echo "       🏔️  Kawan Hiking - Deployment Script"
echo "================================================================"
echo ""

# Step 1: Check prerequisites
print_info "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js $NODE_VERSION or higher."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
    print_warning "Node.js version $NODE_CURRENT detected. Recommended version is $NODE_VERSION or higher."
fi

print_success "Prerequisites check passed!"

# Step 2: Check environment file
print_info "Checking environment configuration..."

if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
    print_warning "No .env.local or .env.production file found!"
    print_info "Creating .env.local template..."
    
    cat > .env.local.example << 'EOF'
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kawanhiking

# JWT Secret (use a strong random string, minimum 32 characters)
JWT_SECRET=your-super-secret-key-change-this-in-production

# Node Environment
NODE_ENV=production

# Base URL (optional, for production)
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
EOF
    
    print_warning "Please copy .env.local.example to .env.local and configure your settings."
    print_warning "Run: cp .env.local.example .env.local && nano .env.local"
else
    print_success "Environment file found!"
fi

# Step 3: Pull latest code (if git repository)
if [ -d ".git" ]; then
    print_info "Pulling latest code from git..."
    git pull origin main || print_warning "Git pull failed, continuing with current code..."
fi

# Step 4: Install dependencies
print_info "Installing dependencies..."
npm ci --production=false
print_success "Dependencies installed!"

# Step 5: Setup upload directories
print_info "Setting up upload directories..."

UPLOAD_DIRS=(
    "public/uploads"
    "public/uploads/destinations"
    "public/uploads/trips"
    "public/uploads/guides"
    "public/uploads/general"
)

for dir in "${UPLOAD_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_info "Created directory: $dir"
    fi
    
    # Create .gitkeep if not exists
    if [ ! -f "$dir/.gitkeep" ]; then
        touch "$dir/.gitkeep"
    fi
done

# Set permissions for upload directories
chmod -R 755 public/uploads

# Set ownership to www-data (nginx user) if running as root
if [ "$EUID" -eq 0 ]; then
    chown -R www-data:www-data public/uploads
    print_info "Set ownership to www-data for upload directories"
fi

print_success "Upload directories configured!"

# Step 6: Build the application
print_info "Building the application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed! Please check the errors above."
    exit 1
fi

# Step 7: Restart the systemd service (if exists)
SERVICE_NAME="kawan-hiking"
if systemctl list-units --type=service | grep -q "$SERVICE_NAME"; then
    print_info "Restarting systemd service..."
    sudo systemctl restart "$SERVICE_NAME"
    print_success "Service restarted!"
else
    print_warning "Systemd service '$SERVICE_NAME' not found."
    print_info "To create a systemd service, copy kawan-hiking.service to /etc/systemd/system/"
    print_info "Then run: sudo systemctl enable $SERVICE_NAME && sudo systemctl start $SERVICE_NAME"
fi

echo ""
echo "================================================================"
echo "       ✅ Deployment Complete!"
echo "================================================================"
echo ""
print_info "Application: $APP_NAME"
print_info "Directory: $APP_DIR"
echo ""
print_info "Next steps:"
echo "  1. Ensure .env.local is configured"
echo "  2. Setup systemd service (if not done)"
echo "  3. Configure Nginx reverse proxy"
echo "  4. Start the application: npm start"
echo ""
