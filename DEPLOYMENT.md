# Deployment Guide - Kawan Hiking

## Server Requirements
- Node.js 18+ 
- MongoDB
- Nginx (recommended) or Apache
- PM2 (for process management)

## Upload Folder Permissions

### 1. Create Upload Directories
```bash
cd /path/to/kawan-hiking
mkdir -p public/uploads/{general,destinations,trips}
```

### 2. Set Permissions
```bash
# Set folder permissions (755 = rwxr-xr-x)
chmod -R 755 public/uploads

# Set ownership to web server user
# For Apache (Ubuntu/Debian):
sudo chown -R www-data:www-data public/uploads

# For Nginx:
sudo chown -R nginx:nginx public/uploads

# Or for your user (if running with PM2):
sudo chown -R $USER:$USER public/uploads
```

### 3. Verify Permissions
```bash
ls -la public/uploads
# Should show: drwxr-xr-x
```

## Environment Variables

Create `.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/kawan_hiking

# JWT
JWT_SECRET=your-super-secret-key-change-this

# Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp
```

## Build & Run

### Development
```bash
npm install
npm run dev
```

### Production
```bash
# Install dependencies
npm install --production

# Build
npm run build

# Start with PM2
pm2 start npm --name "kawan-hiking" -- start
pm2 save
pm2 startup
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Upload size limit
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /path/to/kawan-hiking/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Troubleshooting

### Upload fails with "Permission denied"
```bash
# Check folder permissions
ls -la public/uploads

# Fix permissions
sudo chmod -R 755 public/uploads
sudo chown -R www-data:www-data public/uploads
```

### Images not showing
```bash
# Check if files exist
ls -la public/uploads/general/

# Check Nginx/Apache error logs
sudo tail -f /var/log/nginx/error.log
```

### MongoDB connection issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mongod
```

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Set proper file upload limits
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up firewall (ufw/iptables)
- [ ] Regular backups of MongoDB
- [ ] Keep Node.js and dependencies updated
- [ ] Monitor server logs
- [ ] Set up fail2ban for SSH protection

## Backup Strategy

### Database Backup
```bash
# Backup MongoDB
mongodump --db kawan_hiking --out /backup/mongo/$(date +%Y%m%d)

# Restore
mongorestore --db kawan_hiking /backup/mongo/20260102/kawan_hiking
```

### Files Backup
```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads/

# Restore
tar -xzf uploads-backup-20260102.tar.gz -C public/
```

## Monitoring

### PM2 Monitoring
```bash
# View logs
pm2 logs kawan-hiking

# Monitor resources
pm2 monit

# Restart app
pm2 restart kawan-hiking
```

### Server Health
```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top
```
