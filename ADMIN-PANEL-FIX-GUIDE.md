# Quick Fix Guide for Admin Panel Errors

## Issues Fixed

### 1. Frontend JavaScript Error
**Error:** `Cannot read properties of null (reading 'classList')`

**Fix:** Updated `admin-common.js` to add null checks before accessing `classList` property.

### 2. Backend Database Error
**Error:** `Could not open JPA EntityManager for transaction`

**Fixes:**
- Changed `spring.jpa.hibernate.ddl-auto` from `validate` to `update` in production properties
- Increased HikariCP connection pool size from 10 to 20
- Added connection pool health checks and leak detection
- Added `@Transactional` annotation to `UserService` class for proper transaction management
- Added Hibernate batch processing optimization

## Deployment Steps

### Step 1: Build the Updated Application

On your **local machine** (Windows PowerShell):

```powershell
# Clean and build the project
mvn clean package -DskipTests

# Verify the JAR was created
ls target\jts-application-1.0.0.jar
```

### Step 2: Upload Files to VPS

```powershell
# Replace YOUR_VPS_IP with your actual IP address
$VPS_IP = "YOUR_VPS_IP"

# Upload the new JAR file
scp target\jts-application-1.0.0.jar root@${VPS_IP}:/opt/jts/

# Upload the database setup scripts
scp check-db-connection.sh root@${VPS_IP}:/opt/jts/
scp setup-database.sh root@${VPS_IP}:/opt/jts/
```

### Step 3: Fix Database on VPS

SSH into your VPS and run:

```bash
cd /opt/jts

# Make scripts executable
chmod +x check-db-connection.sh
chmod +x setup-database.sh

# First, check current database status
./check-db-connection.sh

# Then run the database setup/fix script
# Set your database password first
export DB_PASSWORD="your_secure_password"
export DB_USERNAME="postgres"  # or your custom db user
export APP_DIR="/opt/jts"

sudo -E ./setup-database.sh
```

### Step 4: Restart the Application

```bash
# Stop the application
sudo systemctl stop jts

# Verify the new JAR is in place
ls -lh /opt/jts/jts-application-1.0.0.jar

# Start the application with production profile
sudo systemctl start jts

# Check application status
sudo systemctl status jts

# Watch the logs for any errors
sudo journalctl -u jts -f -n 50
```

### Step 5: Verify the Fix

1. Open your browser and go to: `http://your-domain/admin/login`
2. Login with credentials:
   - Username: `admin`
   - Password: `admin`
3. Navigate to Users section
4. Try to create a new user
5. Check if the errors are gone

## Troubleshooting

### If you still see database errors:

1. **Check database credentials in .env file:**
   ```bash
   cat /opt/jts/.env
   ```

2. **Verify database is accessible:**
   ```bash
   sudo -u postgres psql -d JTS -c "SELECT COUNT(*) FROM users;"
   ```

3. **Check application logs:**
   ```bash
   sudo journalctl -u jts -n 100 --no-pager
   ```

4. **Verify PostgreSQL is running:**
   ```bash
   sudo systemctl status postgresql
   ```

5. **Check connection pool:**
   ```bash
   sudo -u postgres psql -d JTS -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'JTS';"
   ```

### If modal errors persist:

1. **Clear browser cache:** Press `Ctrl+Shift+Delete` and clear cached images and files
2. **Hard refresh:** Press `Ctrl+F5` on the admin panel page
3. **Check browser console:** Press `F12` and look for JavaScript errors

## Environment Variables Check

Ensure these are set in `/opt/jts/.env`:

```env
PORT=8088
DATABASE_URL=jdbc:postgresql://localhost:5432/JTS
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
UPLOAD_DIR=uploads/projects
UPLOAD_BASE=uploads
SPRING_PROFILES_ACTIVE=prod
```

## Database Connection Test

Run this to manually test database connection:

```bash
export PGPASSWORD="your_password"
psql -U postgres -d JTS -c "
SELECT 
    'Database: ' || current_database() as info
    UNION ALL
SELECT 
    'Users count: ' || count(*)::text 
FROM users;
"
```

## Common Issues and Solutions

### Issue: "Connection refused"
**Solution:** PostgreSQL is not running
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Issue: "password authentication failed"
**Solution:** Wrong credentials in .env file
```bash
# Update .env with correct password
nano /opt/jts/.env
# Then restart application
sudo systemctl restart jts
```

### Issue: "relation 'users' does not exist"
**Solution:** Run the database setup script again
```bash
sudo -E ./setup-database.sh
```

### Issue: "Too many connections"
**Solution:** Increase max_connections or restart app to clear stuck connections
```bash
sudo systemctl restart jts
sudo systemctl restart postgresql
```

## Success Indicators

✅ Application starts without errors
✅ No "EntityManager" errors in logs
✅ Can create users in admin panel
✅ No JavaScript console errors
✅ Modals open and close properly

## Contact

If issues persist after following this guide:
1. Check the full application logs: `sudo journalctl -u jts -n 200 --no-pager > /tmp/jts-logs.txt`
2. Check the database logs: `sudo tail -100 /var/log/postgresql/postgresql-*.log`
3. Share these logs for further assistance
