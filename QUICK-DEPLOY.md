# JTS Application - Quick Start Production Guide

## 🚀 Fast Track Deployment (20 Minutes)

This is a condensed version for experienced developers. For detailed instructions, see `deployment-guide.md`.

### Step 1: Build the Application (2 min)
```bash
# Windows
build-prod.bat

# Linux/Mac
chmod +x build-prod.sh
./build-prod.sh
```

### Step 2: Prepare VPS (5 min)
```bash
# SSH into your Hostinger VPS
ssh root@YOUR_VPS_IP

# Quick setup script
sudo apt update && sudo apt install -y openjdk-17-jdk postgresql nginx certbot python3-certbot-nginx
sudo systemctl start postgresql nginx
```

### Step 3: Setup Database (2 min)
```bash
sudo -i -u postgres
psql -c "CREATE DATABASE JTS;"
psql -c "CREATE USER jtsuser WITH ENCRYPTED PASSWORD 'YOUR_PASSWORD';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE JTS TO jtsuser;"
exit
```

### Step 4: Deploy Application (3 min)
```bash
# Create directories
sudo mkdir -p /opt/jts/{uploads/projects,logs}

# Upload JAR (from your local machine)
scp target/jts-application-1.0.0.jar root@YOUR_VPS_IP:/opt/jts/

# Create .env file on VPS
sudo nano /opt/jts/.env
```

Paste this (update values):
```env
PORT=8080
DATABASE_URL=jdbc:postgresql://localhost:5432/JTS
DB_USERNAME=jtsuser
DB_PASSWORD=YOUR_PASSWORD
UPLOAD_DIR=/opt/jts/uploads/projects
UPLOAD_BASE=/opt/jts/uploads
SPRING_PROFILES_ACTIVE=prod
```

### Step 5: Create Systemd Service (2 min)
```bash
sudo nano /etc/systemd/system/jts.service
```

Paste this:
```ini
[Unit]
Description=JTS Application
After=network.target

[Service]
User=root
WorkingDirectory=/opt/jts
EnvironmentFile=/opt/jts/.env
ExecStart=/usr/bin/java -Xmx1024m -jar /opt/jts/jts-application-1.0.0.jar
Restart=always

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable jts
sudo systemctl start jts
sudo systemctl status jts
```

### Step 6: Configure Nginx (3 min)
```bash
sudo nano /etc/nginx/sites-available/jts
```

Paste this (replace YOUR_DOMAIN):
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/jts /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Setup SSL (2 min)
```bash
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

### Step 8: Configure Firewall (1 min)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## ✅ Verification

1. **Check Service:** `sudo systemctl status jts`
2. **Check Logs:** `sudo journalctl -u jts -f`
3. **Test Website:** `https://YOUR_DOMAIN`
4. **Test Admin:** `https://YOUR_DOMAIN/admin/login`

## 🔧 Common Commands

```bash
# Restart application
sudo systemctl restart jts

# View logs
sudo journalctl -u jts -f

# Update application
sudo systemctl stop jts
# Upload new JAR
sudo systemctl start jts

# Backup database
sudo -u postgres pg_dump JTS > backup.sql
```

## 🆘 Troubleshooting

**App won't start:** `sudo journalctl -u jts -n 50`
**Database error:** Check credentials in /opt/jts/.env
**502 Bad Gateway:** Check if app is running on port 8080
**Port already in use:** `sudo netstat -tulpn | grep 8080`

## 📋 Pre-Deployment Checklist

- [ ] Build successful: `target/jts-application-1.0.0.jar` exists
- [ ] Environment variables configured
- [ ] Database created and accessible
- [ ] Domain DNS pointed to VPS IP
- [ ] Default admin password will be changed after login

## 🎯 What's Deployed

- **Application:** JTS Tech Solutions Website
- **Port:** 8080 (internal), 80/443 (external)
- **Database:** PostgreSQL on localhost:5432
- **Files:** Uploads stored in /opt/jts/uploads
- **Logs:** /opt/jts/logs and systemd journal

## 📞 Support

- **Email:** jestatechsolutions@gmail.com
- **Phone:** +91 8520999351

---

**Total Time: ~20 minutes** | **Difficulty: Medium** | **Prerequisites: VPS with root access**

