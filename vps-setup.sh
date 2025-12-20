#!/bin/bash
echo -e "${GREEN}Setup info saved to: $APP_DIR/SETUP-INFO.txt${NC}"

EOF
sudo -u postgres pg_dump $DB_NAME > backup_\$(date +%Y%m%d).sql
----------------
Database Backup:

Service:      /etc/systemd/system/$APP_NAME.service
Nginx:        /etc/nginx/sites-available/$APP_NAME

Logs:         $APP_DIR/logs
Uploads:      $APP_DIR/uploads
Environment:  $APP_DIR/.env
JAR Location: $APP_DIR/jts-application-1.0.0.jar
------
Files:

Logs:    sudo journalctl -u $APP_NAME -f
Status:  sudo systemctl status $APP_NAME
Restart: sudo systemctl restart $APP_NAME
Stop:    sudo systemctl stop $APP_NAME
Start:   sudo systemctl start $APP_NAME
---------
Commands:

Port: $APP_PORT
Domain: $DOMAIN
DB User: $DB_USER
Database: $DB_NAME
App Directory: $APP_DIR
Date: $(date)
==================================
JTS Application Setup Information
cat > $APP_DIR/SETUP-INFO.txt <<EOF
# Save configuration info

echo -e "${GREEN}Installation Log saved to: /var/log/jts-setup.log${NC}"
echo ""
echo "- Ensure DNS points to this server's IP"
echo "- Change default admin password after first login"
echo "- Update database password in: $APP_DIR/.env"
echo -e "${YELLOW}Important:${NC}"
echo ""
echo "   ${GREEN}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
echo "5. Setup SSL certificate:"
echo ""
echo "   ${GREEN}sudo journalctl -u $APP_NAME -f${NC}"
echo "4. View logs:"
echo ""
echo "   ${GREEN}sudo systemctl status $APP_NAME${NC}"
echo "3. Check status:"
echo ""
echo "   ${GREEN}sudo systemctl start $APP_NAME${NC}"
echo "2. Start the application:"
echo ""
echo "   ${GREEN}scp target/jts-application-1.0.0.jar root@YOUR_VPS:$APP_DIR/${NC}"
echo "1. Upload JAR file:"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "==============================================${NC}"
echo "  VPS Setup Complete!"
echo -e "${GREEN}=============================================="
echo ""

echo "y" | ufw enable
ufw allow 443/tcp
ufw allow 80/tcp
ufw allow 22/tcp
echo -e "${YELLOW}Configuring firewall...${NC}"
# Configure firewall

apt install -y certbot python3-certbot-nginx
echo -e "${YELLOW}Installing Certbot for SSL...${NC}"
# Install Certbot for SSL

echo -e "${GREEN}Systemd service created${NC}"

systemctl enable $APP_NAME
systemctl daemon-reload

EOF
WantedBy=multi-user.target
[Install]

SyslogIdentifier=$APP_NAME
StandardError=journal
StandardOutput=journal
RestartSec=10
Restart=always
ExecStart=/usr/bin/java -Xmx1024m -Xms512m -jar $APP_DIR/jts-application-1.0.0.jar --spring.profiles.active=prod
EnvironmentFile=$APP_DIR/.env
WorkingDirectory=$APP_DIR
Type=simple
User=$APP_USER
[Service]

After=syslog.target network.target postgresql.service
Description=JTS Application
[Unit]
cat > /etc/systemd/system/$APP_NAME.service <<EOF
echo -e "${YELLOW}[8/8] Creating systemd service...${NC}"
# Create systemd service

echo -e "${GREEN}Nginx configured successfully${NC}"

systemctl enable nginx
systemctl restart nginx

fi
    exit 1
    echo -e "${RED}Nginx configuration error${NC}"
if [ $? -ne 0 ]; then
nginx -t
# Test Nginx configuration

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
# Enable Nginx site

EOF
}
    }
        add_header Cache-Control "public, immutable";
        expires 30d;
        proxy_cache_valid 200 30d;
        proxy_pass http://localhost:$APP_PORT;
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2|ttf|eot)$ {

    }
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        proxy_connect_timeout 60s;

        proxy_set_header Connection "upgrade";
        proxy_set_header Upgrade \$http_upgrade;
        proxy_http_version 1.1;

        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header Host \$host;
        proxy_pass http://localhost:$APP_PORT;
    location / {

    client_max_body_size 50M;
    server_name $DOMAIN www.$DOMAIN;
    listen 80;
server {
cat > /etc/nginx/sites-available/$APP_NAME <<EOF
# Configure Nginx

apt install -y nginx
echo -e "${YELLOW}[7/8] Installing Nginx...${NC}"
# Install Nginx

echo -e "${GREEN}Environment file created${NC}"
chmod 600 $APP_DIR/.env

EOF
SPRING_PROFILES_ACTIVE=prod
UPLOAD_BASE=$APP_DIR/uploads
UPLOAD_DIR=$APP_DIR/uploads/projects
DB_PASSWORD=$DB_PASSWORD
DB_USERNAME=$DB_USER
DATABASE_URL=jdbc:postgresql://localhost:5432/$DB_NAME
PORT=$APP_PORT
cat > $APP_DIR/.env <<EOF
echo -e "${YELLOW}[6/8] Creating environment file...${NC}"
# Create environment file

chmod -R 755 $APP_DIR
mkdir -p $APP_DIR/{uploads/projects,logs}
echo -e "${YELLOW}[5/8] Creating application directories...${NC}"
# Create application directories

echo -e "${GREEN}Database created successfully${NC}"

EOF
\q
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME;
sudo -u postgres psql <<EOF
echo -e "${YELLOW}[4/8] Setting up database...${NC}"
# Setup database

systemctl enable postgresql
systemctl start postgresql
# Start and enable PostgreSQL

apt install -y postgresql postgresql-contrib
echo -e "${YELLOW}[3/8] Installing PostgreSQL...${NC}"
# Install PostgreSQL

fi
    exit 1
    echo -e "${RED}Java installation failed${NC}"
if [ $? -ne 0 ]; then
java -version
# Verify Java installation

apt install -y openjdk-17-jdk
echo -e "${YELLOW}[2/8] Installing Java 17...${NC}"
# Install Java 17

apt update && apt upgrade -y
echo -e "${YELLOW}[1/8] Updating system...${NC}"
# Update system

fi
    exit 1
    echo -e "${RED}Please run as root (use sudo)${NC}"
if [ "$EUID" -ne 0 ]; then
# Check if running as root

echo ""
echo "  Domain: $DOMAIN"
echo "  DB User: $DB_USER"
echo "  Database: $DB_NAME"
echo "  App Directory: $APP_DIR"
echo -e "${YELLOW}Configuration:${NC}"

APP_PORT="8080"
DOMAIN="your-domain.com"  # CHANGE THIS!
DB_PASSWORD="CHANGE_THIS_PASSWORD"  # CHANGE THIS!
DB_USER="jtsuser"
DB_NAME="JTS"
APP_USER="root"
APP_DIR="/opt/jts"
APP_NAME="jts"
# Configuration (EDIT THESE VALUES)

NC='\033[0m' # No Color
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
# Colors

echo ""
echo "=============================================="
echo "  JTS Application - VPS Setup Script"
echo "=============================================="

set -e  # Exit on error

###########################################
# Auto-configure Hostinger VPS for deployment
# JTS Application - VPS Setup Script
###########################################


