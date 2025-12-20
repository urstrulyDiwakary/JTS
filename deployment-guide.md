# JTS Application - Production Deployment Guide

## Prerequisites
- Java 17 or higher installed on VPS
- PostgreSQL 12+ database
- 2GB+ RAM recommended
- 10GB+ disk space

## Deployment Steps for Hostinger VPS

### 1. Prepare the Application

```bash
# Build the production JAR
mvn clean package -DskipTests

# This creates: target/jts-application-1.0.0.jar
```

### 2. Setup VPS Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17
sudo apt install openjdk-17-jdk -y

# Verify Java installation
java -version

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Setup Database

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql
CREATE DATABASE JTS;
CREATE USER jtsuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE JTS TO jtsuser;
\q

exit
```

### 4. Transfer Files to VPS

```bash
# From your local machine (PowerShell/Terminal)
# Replace YOUR_VPS_IP with actual IP address

# Upload JAR file
scp target/jts-application-1.0.0.jar root@YOUR_VPS_IP:/opt/jts/

# Upload uploads directory (if exists with content)
scp -r uploads root@YOUR_VPS_IP:/opt/jts/

# Upload static resources (if not packaged in JAR)
scp -r src/main/resources/static root@YOUR_VPS_IP:/opt/jts/
```

### 5. Configure Environment Variables on VPS

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Create application directory
sudo mkdir -p /opt/jts
sudo mkdir -p /opt/jts/uploads/projects
sudo mkdir -p /opt/jts/logs

# Create environment file
sudo nano /opt/jts/.env
```

Add these variables to `.env`:
```
PORT=8080
DATABASE_URL=jdbc:postgresql://localhost:5432/JTS
DB_USERNAME=jtsuser
DB_PASSWORD=your_secure_password
UPLOAD_DIR=/opt/jts/uploads/projects
UPLOAD_BASE=/opt/jts/uploads
SPRING_PROFILES_ACTIVE=prod
```

### 6. Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/jts.service
```

Add this content:
```ini
[Unit]
Description=JTS Application
After=syslog.target
After=network.target

[Service]
User=root
Type=simple
WorkingDirectory=/opt/jts
EnvironmentFile=/opt/jts/.env
ExecStart=/usr/bin/java -Xmx1024m -Xms512m -jar /opt/jts/jts-application-1.0.0.jar --spring.profiles.active=prod
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=jts

[Install]
WantedBy=multi-user.target
```

### 7. Start the Application

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable jts

# Start the service
sudo systemctl start jts

# Check status
sudo systemctl status jts

# View logs
sudo journalctl -u jts -f
```

### 8. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/jts
```

Add this content (replace YOUR_DOMAIN with actual domain):
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;

    # Increase upload size limit
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:8080;
        proxy_cache_valid 200 30d;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/jts /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 9. Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate (replace YOUR_DOMAIN)
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN

# Certbot will automatically configure SSL and redirect HTTP to HTTPS
```

### 10. Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Maintenance Commands

### Update Application
```bash
# Stop service
sudo systemctl stop jts

# Backup old JAR
sudo mv /opt/jts/jts-application-1.0.0.jar /opt/jts/jts-application-1.0.0.jar.backup

# Upload new JAR
scp target/jts-application-1.0.0.jar root@YOUR_VPS_IP:/opt/jts/

# Start service
sudo systemctl start jts
```

### View Logs
```bash
# Application logs
sudo journalctl -u jts -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Application file logs
sudo tail -f /opt/jts/logs/jts-application.log
```

### Database Backup
```bash
# Create backup
sudo -u postgres pg_dump JTS > /backup/jts_backup_$(date +%Y%m%d).sql

# Restore backup
sudo -u postgres psql JTS < /backup/jts_backup_YYYYMMDD.sql
```

### Restart Services
```bash
# Restart application
sudo systemctl restart jts

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Monitoring

### Check Service Status
```bash
sudo systemctl status jts
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Check Disk Space
```bash
df -h
du -sh /opt/jts/uploads/*
```

### Check Memory Usage
```bash
free -h
top
htop
```

## Troubleshooting

### Application won't start
```bash
# Check logs
sudo journalctl -u jts -n 100

# Check if port is already in use
sudo netstat -tulpn | grep 8080

# Check Java installation
java -version

# Test JAR manually
cd /opt/jts
java -jar jts-application-1.0.0.jar --spring.profiles.active=prod
```

### Database connection issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U jtsuser -d JTS

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### Nginx issues
```bash
# Test configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check if Nginx is listening
sudo netstat -tulpn | grep nginx
```

## Security Recommendations

1. **Change default passwords** - Update all database and admin passwords
2. **Enable firewall** - Only allow necessary ports
3. **Regular updates** - Keep system and applications updated
4. **SSL/TLS** - Always use HTTPS in production
5. **Backup strategy** - Regular automated backups
6. **Monitor logs** - Set up log monitoring and alerts
7. **Strong passwords** - Use complex passwords for all accounts
8. **Limit SSH access** - Use SSH keys instead of passwords
9. **Database security** - Restrict database access to localhost only
10. **File permissions** - Ensure proper file permissions (chmod 600 for .env files)

## Performance Optimization

1. **JVM Tuning** - Adjust heap size based on available RAM
2. **Database indexing** - Create indexes for frequently queried columns
3. **Static file caching** - Use CDN for static assets
4. **Connection pooling** - Configure HikariCP settings
5. **Gzip compression** - Enable in Nginx
6. **Log rotation** - Configure logrotate for application logs

## Domain Configuration

Point your domain's DNS to your VPS IP:
- A Record: @ → YOUR_VPS_IP
- A Record: www → YOUR_VPS_IP

## Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate installed and working
- [ ] Database backup configured
- [ ] Logs are being written correctly
- [ ] File uploads working
- [ ] Admin panel accessible
- [ ] All static resources loading
- [ ] Email notifications working (if configured)
- [ ] Monitoring set up
- [ ] Firewall configured
- [ ] All credentials changed from defaults

## Support

For issues or questions, check:
- Application logs: `sudo journalctl -u jts -f`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`

## Quick Reference

```bash
# Common commands
sudo systemctl start jts          # Start app
sudo systemctl stop jts           # Stop app
sudo systemctl restart jts        # Restart app
sudo systemctl status jts         # Check status
sudo journalctl -u jts -f        # View logs
mvn clean package                 # Build JAR
```

