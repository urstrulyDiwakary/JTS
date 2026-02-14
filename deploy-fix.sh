#!/bin/bash

# ============================================
# JTS Quick Fix Deployment Script
# ============================================
# This script automates the entire fix deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "============================================"
echo "  JTS Admin Panel Error Fix Deployment"
echo "============================================"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root: sudo bash deploy-fix.sh${NC}"
    exit 1
fi

# Configuration
APP_DIR="${APP_DIR:-/opt/jts}"
DB_NAME="JTS"
DB_USER="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"
SERVICE_NAME="jts"

# Validate environment
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: DB_PASSWORD environment variable not set${NC}"
    echo "Set it with: export DB_PASSWORD='your_password'"
    exit 1
fi

echo -e "${YELLOW}Configuration:${NC}"
echo "  App Directory: $APP_DIR"
echo "  Database Name: $DB_NAME"
echo "  Database User: $DB_USER"
echo ""

# Step 1: Backup current JAR
echo -e "${YELLOW}[1/6] Creating backup...${NC}"
if [ -f "$APP_DIR/jts-application-1.0.0.jar" ]; then
    BACKUP_FILE="$APP_DIR/jts-application-1.0.0.jar.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$APP_DIR/jts-application-1.0.0.jar" "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠ No existing JAR found (first deployment?)${NC}"
fi
echo ""

# Step 2: Stop application
echo -e "${YELLOW}[2/6] Stopping application...${NC}"
systemctl stop $SERVICE_NAME 2>/dev/null || echo "Service not running"
echo -e "${GREEN}✓ Application stopped${NC}"
echo ""

# Step 3: Setup database
echo -e "${YELLOW}[3/6] Setting up database...${NC}"

# Ensure PostgreSQL is running
systemctl start postgresql 2>/dev/null || true
systemctl enable postgresql 2>/dev/null || true

# Run database setup
sudo -u postgres psql <<EOF
-- Create database if not exists
SELECT 'CREATE DATABASE ${DB_NAME}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};

\c ${DB_NAME}

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='department') THEN
        ALTER TABLE users ADD COLUMN department VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='status') THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'Active';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END \$\$;

-- Grant all permissions
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};

-- Insert default admin user
INSERT INTO users (username, email, password, role, status)
VALUES ('admin', 'admin@admin.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'ADMIN', 'Active')
ON CONFLICT (username) DO NOTHING;

-- Optimize PostgreSQL
ALTER SYSTEM SET max_connections = 100;
SELECT pg_reload_conf();
EOF

echo -e "${GREEN}✓ Database configured${NC}"
echo ""

# Step 4: Update environment file
echo -e "${YELLOW}[4/6] Updating environment configuration...${NC}"
if [ -f "$APP_DIR/.env" ]; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=jdbc:postgresql://localhost:5432/${DB_NAME}|" "$APP_DIR/.env"
    sed -i "s|^DB_USERNAME=.*|DB_USERNAME=${DB_USER}|" "$APP_DIR/.env"
    sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD}|" "$APP_DIR/.env"
    sed -i "s|^SPRING_PROFILES_ACTIVE=.*|SPRING_PROFILES_ACTIVE=prod|" "$APP_DIR/.env"
    echo -e "${GREEN}✓ Environment updated${NC}"
else
    echo -e "${YELLOW}⚠ No .env file found${NC}"
fi
echo ""

# Step 5: Verify JAR file
echo -e "${YELLOW}[5/6] Verifying application file...${NC}"
if [ ! -f "$APP_DIR/jts-application-1.0.0.jar" ]; then
    echo -e "${RED}Error: JAR file not found at $APP_DIR/jts-application-1.0.0.jar${NC}"
    echo "Please upload the JAR file first:"
    echo "  scp target/jts-application-1.0.0.jar root@YOUR_VPS_IP:$APP_DIR/"
    exit 1
fi
echo -e "${GREEN}✓ JAR file found${NC}"
JAR_SIZE=$(du -h "$APP_DIR/jts-application-1.0.0.jar" | cut -f1)
echo "  File size: $JAR_SIZE"
echo ""

# Step 6: Start application
echo -e "${YELLOW}[6/6] Starting application...${NC}"
systemctl start $SERVICE_NAME

# Wait for startup
echo -n "Waiting for application to start"
for i in {1..10}; do
    sleep 2
    echo -n "."
    if systemctl is-active --quiet $SERVICE_NAME; then
        echo ""
        echo -e "${GREEN}✓ Application started successfully${NC}"
        break
    fi
done
echo ""

# Check status
echo -e "${YELLOW}Service Status:${NC}"
systemctl status $SERVICE_NAME --no-pager -l | head -n 10

echo ""
echo -e "${GREEN}============================================"
echo "  Deployment Complete!"
echo "============================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Check logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  2. Test admin panel: http://your-domain/admin/login"
echo "  3. Login with: admin / admin"
echo ""
echo "Troubleshooting:"
echo "  - View logs: sudo journalctl -u $SERVICE_NAME -n 100"
echo "  - Check database: sudo -u postgres psql -d $DB_NAME -c 'SELECT COUNT(*) FROM users;'"
echo "  - Restart app: sudo systemctl restart $SERVICE_NAME"
echo ""

# Show recent logs
echo -e "${YELLOW}Recent application logs:${NC}"
journalctl -u $SERVICE_NAME -n 20 --no-pager

echo ""
echo -e "${GREEN}✅ All done! Your admin panel should now work correctly.${NC}"
