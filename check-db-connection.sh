#!/bin/bash

# Database Connection Diagnostic Script
# Run this on your VPS to check database connectivity

echo "=========================================="
echo "JTS Database Connection Diagnostics"
echo "=========================================="
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL service status..."
sudo systemctl status postgresql | head -n 5
echo ""

# Check PostgreSQL version
echo "2. PostgreSQL version:"
psql --version
echo ""

# Check if database exists
echo "3. Checking if JTS database exists..."
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w JTS
if [ $? -eq 0 ]; then
    echo "✓ JTS database exists"
else
    echo "✗ JTS database NOT found - needs to be created!"
fi
echo ""

# Test database connection with app credentials
echo "4. Testing database connection with application credentials..."
DB_USER="${DB_USERNAME:-postgres}"
DB_NAME="JTS"

echo "Attempting to connect as user: $DB_USER"
psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" 2>&1 | head -n 3
if [ $? -eq 0 ]; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection FAILED"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Verify database credentials in environment variables"
    echo "2. Ensure user has proper permissions: GRANT ALL PRIVILEGES ON DATABASE JTS TO $DB_USER;"
    echo "3. Check pg_hba.conf for authentication settings"
fi
echo ""

# Check users table structure
echo "5. Checking 'users' table structure..."
sudo -u postgres psql -d JTS -c "\d users" 2>&1 | head -n 20
echo ""

# Check connection pool settings
echo "6. Checking PostgreSQL connection limits..."
sudo -u postgres psql -d JTS -c "SHOW max_connections;"
echo ""

# Check current active connections
echo "7. Current active database connections:"
sudo -u postgres psql -d JTS -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE datname = 'JTS';"
echo ""

# Check database size
echo "8. Database size:"
sudo -u postgres psql -d JTS -c "SELECT pg_size_pretty(pg_database_size('JTS')) as database_size;"
echo ""

# Check for any table locks
echo "9. Checking for table locks..."
sudo -u postgres psql -d JTS -c "SELECT relation::regclass, mode, granted FROM pg_locks WHERE relation IS NOT NULL LIMIT 5;"
echo ""

echo "=========================================="
echo "Diagnostics complete!"
echo "=========================================="
