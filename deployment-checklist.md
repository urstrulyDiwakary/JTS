# JTS Application - Production Deployment Checklist
**Deployment Verified By:** _______________ **Date:** _______________

## Status: ☐ Ready for Deployment | ☐ Deployed Successfully | ☐ Issues Found

---

_______________________________________________
_______________________________________________
_______________________________________________
**Resolution:**

_______________________________________________
_______________________________________________
_______________________________________________
**Issues Encountered:**

**Domain:** _______________
**Server IP:** _______________
**Environment:** Production
**Version:** 1.0.0
**Deployed By:** _______________
**Deployment Date:** _______________

## Notes

- Configuration: application-prod.properties
- Build Scripts: build-prod.bat / build-prod.sh
- Environment Variables: .env.example
- Deployment Guide: deployment-guide.md

## Documentation Links

- [Domain control panel URL]
- [Domain registrar]
**Domain Support:**

- [Hosting control panel URL]
- Hostinger VPS Support
**Hosting Support:**

- Phone: +91 8520999351
- Email: jestatechsolutions@gmail.com
- Developer: [Your Name/Team]
**Technical Support:**

## Contact Information

6. Investigate issues
5. Verify functionality
4. Start old application
3. Restore database backup (if needed)
2. Restore previous JAR file
1. Stop the new application
If deployment fails:

## Rollback Procedure

5. Optimize if needed
4. Clear cache if needed
3. Check log file sizes
2. Check database queries
1. Check CPU and memory usage
### Performance Issues

5. Restore from backup if needed
4. Check disk space
3. Check connection limits
2. Check database logs
1. Check PostgreSQL status
### Database Issues

6. Notify stakeholders
5. Restart service if needed
4. Check disk space
3. Check database connection
2. Check application logs
1. Check systemd service status
### Application Down

## Emergency Procedures

- [ ] Performance optimization review
- [ ] Review security patches
- [ ] Update dependencies
- [ ] Check SSL certificate expiry
- [ ] Review and rotate logs
- [ ] Update system packages
### Monthly Tasks

- [ ] Test backup restoration
- [ ] Monitor performance metrics
- [ ] Check for security updates
- [ ] Review access logs
### Weekly Tasks

- [ ] Verify backups ran
- [ ] Check disk space
- [ ] Monitor error logs
- [ ] Check application status
### Daily Tasks

## Maintenance Checklist

- [ ] Application files backed up
- [ ] Backup tested
- [ ] Recovery procedure documented
- [ ] Backup storage configured
- [ ] Backup schedule configured
- [ ] Database backup script created
### 5. Backup & Recovery

- [ ] Uptime monitoring (optional)
- [ ] Database monitoring
- [ ] CPU monitoring
- [ ] Memory monitoring
- [ ] Disk space monitoring
- [ ] Error logs monitored
- [ ] Application logs accessible
### 4. Monitoring Setup

- [ ] Security headers present
- [ ] File upload security verified
- [ ] SQL injection tested
- [ ] Session timeout working
- [ ] Admin panel requires authentication
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid
- [ ] HTTPS working
### 3. Security Testing

- [ ] Database query performance good
- [ ] CPU usage normal
- [ ] Memory usage reasonable
- [ ] Mobile performance verified
- [ ] CSS/JS files loading
- [ ] Images loading correctly
- [ ] Page load times acceptable (<3s)
### 2. Performance Testing

- [ ] Error pages display properly
- [ ] Forms submitting correctly
- [ ] Database operations working
- [ ] File uploads working
- [ ] Admin dashboard accessible
- [ ] Admin login works
- [ ] All public pages accessible
- [ ] Homepage loads correctly
### 1. Application Testing

## Post-Deployment Verification

- [ ] Rules tested
- [ ] Firewall enabled
- [ ] PostgreSQL port (5432) blocked externally
- [ ] Port 443 (HTTPS) allowed
- [ ] Port 80 (HTTP) allowed
- [ ] Port 22 (SSH) allowed
- [ ] UFW installed
### 8. Firewall Configuration

- [ ] HTTPS tested
- [ ] HTTP to HTTPS redirect enabled
- [ ] Auto-renewal configured
- [ ] SSL certificate obtained
- [ ] Certbot installed
- [ ] A records pointing to VPS
- [ ] Domain DNS configured
### 7. SSL/HTTPS Setup

- [ ] Service restarted
- [ ] Gzip compression enabled
- [ ] Static file caching configured
- [ ] Upload size limit increased
- [ ] Reverse proxy configured
- [ ] Configuration tested (nginx -t)
- [ ] Site configuration created
- [ ] Nginx installed
### 6. Nginx Configuration

- [ ] Application logs verified
- [ ] Service enabled and started
- [ ] Systemd service file created
- [ ] Uploads directory initialized
- [ ] Static resources uploaded (if external)
- [ ] .env file created with production values
- [ ] JAR file uploaded
### 5. Application Deployment

- [ ] Backup script configured
- [ ] Connection tested
- [ ] Privileges granted
- [ ] Database user created
- [ ] Database created
- [ ] PostgreSQL service running
### 4. Database Setup

- [ ] Backup directory created
- [ ] Proper permissions set
- [ ] /opt/jts/logs created
- [ ] /opt/jts/uploads created
- [ ] /opt/jts directory created
### 3. Directory Structure

- [ ] Monitoring tools installed (optional)
- [ ] Certbot installed (for SSL)
- [ ] Git installed (optional)
- [ ] Nginx installed
- [ ] PostgreSQL installed
- [ ] Java 17 installed
### 2. Software Installation

- [ ] Hostname set
- [ ] Timezone configured
- [ ] System updated (apt update && apt upgrade)
- [ ] SSH key authentication set up
- [ ] Non-root user created (optional)
- [ ] Root password changed
- [ ] SSH access configured
- [ ] VPS instance created
### 1. Server Preparation

## VPS Server Setup Checklist

- [ ] Release notes prepared
- [ ] Version number updated
- [ ] Static resources bundled
- [ ] All dependencies included
- [ ] JAR size reasonable (<100MB)
- [ ] Production JAR created
- [ ] Maven build successful
### 5. Build & Package

- [ ] Database migrations ready
- [ ] Initial data seeded (if needed)
- [ ] Database indexes optimized
- [ ] Connection pooling configured
- [ ] Database backup strategy planned
- [ ] Database user created with limited privileges
- [ ] Production database created
### 4. Database

- [ ] API keys moved to environment variables
- [ ] Database credentials secured
- [ ] .gitignore configured properly
- [ ] Sensitive data removed from git
- [ ] .env.example created
- [ ] Environment variables documented
- [ ] application-prod.properties created
### 3. Configuration Files

- [ ] Security headers configured
- [ ] Rate limiting considered
- [ ] File upload validation in place
- [ ] CSRF protection enabled
- [ ] XSS protection enabled
- [ ] SQL injection protection verified
- [ ] Session security enabled
- [ ] HTTPS/SSL configured
- [ ] Remove or secure development endpoints
- [ ] Update all passwords to strong values
- [ ] Change default admin credentials
### 2. Security Review

- [ ] All images optimized
- [ ] SEO meta tags verified
- [ ] Cross-browser compatibility checked
- [ ] Mobile responsive design verified
- [ ] Error pages customized and tested
- [ ] Database migrations tested
- [ ] File upload functionality tested
- [ ] All endpoints tested (public and admin)
- [ ] No hardcoded credentials in code
- [ ] All features tested locally
### 1. Code Review & Testing

## Pre-Deployment Checklist


