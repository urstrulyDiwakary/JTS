# JTS Application - Production Ready

## 🎯 Overview

Jesta Tech Solutions (JTS) is a comprehensive business management platform built with Spring Boot, featuring:
- Public website with service showcase
- Admin dashboard for project management
- Contact form management
- Billing and invoicing system
- File upload capabilities
- PostgreSQL database
- Responsive design for mobile and desktop

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** December 2025

## 📋 Quick Links

- **🚀 Quick Deploy Guide:** [QUICK-DEPLOY.md](QUICK-DEPLOY.md)
- **📖 Detailed Deployment:** [deployment-guide.md](deployment-guide.md)
- **✅ Deployment Checklist:** [deployment-checklist.md](deployment-checklist.md)
- **🔐 Environment Setup:** [.env.example](.env.example)

## 🛠️ Technology Stack

- **Backend:** Spring Boot 3.2.0
- **Language:** Java 17
- **Database:** PostgreSQL 12+
- **Template Engine:** Thymeleaf
- **Build Tool:** Maven 3.x
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Icons:** Font Awesome 6.4.0
- **Fonts:** Google Fonts (Poppins)

## 📦 Features

### Public Website
- ✅ Homepage with hero banner
- ✅ Services showcase
- ✅ Portfolio gallery
- ✅ About page
- ✅ Contact form
- ✅ SEO optimized
- ✅ Mobile responsive
- ✅ Social media integration

### Admin Panel
- ✅ Secure login system
- ✅ Dashboard with analytics
- ✅ Project management (CRUD)
- ✅ Task management
- ✅ User management
- ✅ Billing & invoicing
- ✅ Contact form management
- ✅ Settings configuration
- ✅ File upload system

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- PostgreSQL 12 or higher
- 2GB RAM minimum
- 10GB disk space

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JTS
   ```

2. **Setup Database**
   ```sql
   CREATE DATABASE JTS;
   CREATE USER jtsuser WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE JTS TO jtsuser;
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Build and Run**
   ```bash
   # Windows
   mvn clean install
   mvn spring-boot:run

   # Linux/Mac
   mvn clean install
   mvn spring-boot:run
   ```

5. **Access Application**
   - Public Site: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin/login
   - Default Credentials: `admin` / `admin`

## 📦 Production Build

### Windows
```bash
build-prod.bat
```

### Linux/Mac
```bash
chmod +x build-prod.sh
./build-prod.sh
```

This creates: `target/jts-application-1.0.0.jar`

## 🌐 Production Deployment

### Quick Deploy (20 minutes)
Follow [QUICK-DEPLOY.md](QUICK-DEPLOY.md) for fast deployment.

### Detailed Deploy
Follow [deployment-guide.md](deployment-guide.md) for comprehensive instructions.

### Deployment Checklist
Use [deployment-checklist.md](deployment-checklist.md) to track progress.

## 🔧 Configuration

### Environment Variables

Create a `.env` file or set environment variables:

```env
PORT=8080
DATABASE_URL=jdbc:postgresql://localhost:5432/JTS
DB_USERNAME=jtsuser
DB_PASSWORD=your_secure_password
UPLOAD_DIR=uploads/projects
UPLOAD_BASE=uploads
SPRING_PROFILES_ACTIVE=prod
```

### Application Profiles

- **Development:** `application.properties`
- **Production:** `application-prod.properties`

Activate profile:
```bash
java -jar app.jar --spring.profiles.active=prod
```

## 📁 Project Structure

```
JTS/
├── src/
│   ├── main/
│   │   ├── java/com/app/
│   │   │   ├── admin/          # Admin controllers
│   │   │   ├── config/         # Configuration classes
│   │   │   ├── entity/         # JPA entities
│   │   │   ├── publicc/        # Public controllers
│   │   │   ├── repository/     # Data repositories
│   │   │   ├── service/        # Business logic
│   │   │   ├── util/           # Utility classes
│   │   │   └── JtsApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-prod.properties
│   │       ├── static/         # CSS, JS, images
│   │       └── templates/      # Thymeleaf templates
├── uploads/                    # File uploads
├── deployment-guide.md
├── deployment-checklist.md
├── QUICK-DEPLOY.md
├── build-prod.bat
├── build-prod.sh
├── .env.example
├── .gitignore
└── pom.xml
```

## 🔐 Security

### Implemented Security Features
- ✅ Session management with HTTP-only cookies
- ✅ SQL injection protection via JPA
- ✅ File upload validation
- ✅ HTTPS support in production
- ✅ Secure password storage
- ✅ Environment variable configuration

### Production Security Checklist
- [ ] Change all default passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW)
- [ ] Set up regular backups
- [ ] Enable security headers
- [ ] Configure CORS if needed
- [ ] Set strong session timeout
- [ ] Disable development tools

## 📊 Monitoring

### Logs Location

**Development:**
- Console output
- `logs/jts-application.log`

**Production:**
- Systemd journal: `sudo journalctl -u jts -f`
- Application logs: `/opt/jts/logs/jts-application.log`
- Nginx logs: `/var/log/nginx/`

### Health Check

Access: `http://localhost:8080/actuator/health`

## 🔄 Maintenance

### Update Application

1. Build new version
2. Upload to server
3. Restart service

```bash
sudo systemctl stop jts
# Upload new JAR
sudo systemctl start jts
```

### Database Backup

```bash
# Backup
sudo -u postgres pg_dump JTS > backup_$(date +%Y%m%d).sql

# Restore
sudo -u postgres psql JTS < backup_20250120.sql
```

### View Logs

```bash
# Application logs
sudo journalctl -u jts -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check service status
sudo systemctl status jts

# View recent logs
sudo journalctl -u jts -n 100

# Check port usage
sudo netstat -tulpn | grep 8080
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U jtsuser -d JTS

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

### 502 Bad Gateway

1. Check if application is running: `sudo systemctl status jts`
2. Check if port 8080 is accessible: `curl http://localhost:8080`
3. Check Nginx configuration: `sudo nginx -t`
4. View Nginx logs: `sudo tail -f /var/log/nginx/error.log`

## 📚 API Endpoints

### Public Routes
- `GET /` - Homepage
- `GET /services` - Services page
- `GET /portfolio` - Portfolio page
- `GET /about` - About page
- `GET /contact` - Contact page
- `POST /api/contact` - Submit contact form

### Admin Routes (Authentication Required)
- `GET /admin/login` - Admin login
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/projects` - Project management
- `GET /admin/tasks` - Task management
- `GET /admin/users` - User management
- `GET /admin/billing` - Billing & invoicing
- `GET /admin/settings` - Settings

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Copyright © 2025 Jesta Tech Solutions. All Rights Reserved.

## 📞 Support

- **Email:** jestatechsolutions@gmail.com
- **Phone:** +91 8520999351
- **Website:** https://jestatechsolutions.com
- **Instagram:** @jestatechsolutions
- **LinkedIn:** Jesta Tech Solutions

## 🎉 Credits

Designed & Developed with ❤️ by JTS Team

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Build:** See `target/jts-application-1.0.0.jar`  
**Ready to Deploy:** Yes

