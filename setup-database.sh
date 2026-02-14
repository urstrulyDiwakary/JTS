#!/bin/bash

# JTS Database Setup and Fix Script for VPS
# This script will ensure the database is properly configured

set -e  # Exit on any error

echo "=========================================="
echo "JTS Database Setup Script"
echo "=========================================="
echo ""

# Configuration
DB_NAME="JTS"
DB_USER="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"
APP_DIR="${APP_DIR:-/opt/jts}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking PostgreSQL service...${NC}"
systemctl status postgresql --no-pager | head -n 5 || {
    echo -e "${RED}PostgreSQL is not running. Starting it...${NC}"
    systemctl start postgresql
    systemctl enable postgresql
}
echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

echo -e "${YELLOW}Step 2: Creating database and user (if not exists)...${NC}"
sudo -u postgres psql <<EOF
-- Create database if not exists
SELECT 'CREATE DATABASE ${DB_NAME}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

-- Create user if not exists (only if not using default postgres user)
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '${DB_USER}') THEN
        CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};

\c ${DB_NAME}

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};

-- Increase connection limit if needed
ALTER SYSTEM SET max_connections = 100;
SELECT pg_reload_conf();
EOF

echo -e "${GREEN}✓ Database and user configured${NC}"
echo ""

echo -e "${YELLOW}Step 3: Creating/updating users table...${NC}"
sudo -u postgres psql -d ${DB_NAME} <<EOF
-- Create users table with proper structure
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

-- Add missing columns if they don't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='department') THEN
        ALTER TABLE users ADD COLUMN department VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='status') THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'Active';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END \$\$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default admin user if not exists
INSERT INTO users (username, email, password, role, status)
VALUES ('admin', 'admin@admin.com',
        '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', -- SHA-256 hash of 'admin'
        'ADMIN', 'Active')
ON CONFLICT (username) DO NOTHING;

-- Show table structure
\d users

-- Show count of users
SELECT COUNT(*) as total_users FROM users;
EOF

echo -e "${GREEN}✓ Users table configured${NC}"
echo ""

echo -e "${YELLOW}Step 4: Creating other required tables...${NC}"
sudo -u postgres psql -d ${DB_NAME} <<EOF
-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    file_paths TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'TODO',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    assigned_to VARCHAR(255),
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing table
CREATE TABLE IF NOT EXISTS billing (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    due_date DATE,
    paid_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    service VARCHAR(100),
    message TEXT,
    status VARCHAR(50) DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

echo -e "${GREEN}✓ All tables created${NC}"
echo ""

echo -e "${YELLOW}Step 5: Setting up connection pool optimization...${NC}"
sudo -u postgres psql <<EOF
-- Optimize for connection pooling
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

SELECT pg_reload_conf();
EOF

echo -e "${GREEN}✓ PostgreSQL optimized${NC}"
echo ""

echo -e "${YELLOW}Step 6: Testing connection...${NC}"
export PGPASSWORD="${DB_PASSWORD}"
psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 'Connection successful!' as status, version();" || {
    echo -e "${RED}Connection test failed!${NC}"
    exit 1
}
echo -e "${GREEN}✓ Connection test passed${NC}"
echo ""

echo -e "${YELLOW}Step 7: Setting environment variables...${NC}"
if [ -f "${APP_DIR}/.env" ]; then
    # Update .env file with correct database settings
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=jdbc:postgresql://localhost:5432/${DB_NAME}|" "${APP_DIR}/.env"
    sed -i "s|^DB_USERNAME=.*|DB_USERNAME=${DB_USER}|" "${APP_DIR}/.env"
    sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASSWORD}|" "${APP_DIR}/.env"
    echo -e "${GREEN}✓ Environment variables updated${NC}"
else
    echo -e "${YELLOW}⚠ No .env file found at ${APP_DIR}/.env${NC}"
fi
echo ""

echo -e "${GREEN}=========================================="
echo "Database setup completed successfully!"
echo "==========================================${NC}"
echo ""
echo "Database Information:"
echo "  Database Name: ${DB_NAME}"
echo "  Database User: ${DB_USER}"
echo "  Connection URL: jdbc:postgresql://localhost:5432/${DB_NAME}"
echo ""
echo "Next steps:"
echo "1. Restart the application: sudo systemctl restart jts"
echo "2. Check application logs: sudo journalctl -u jts -n 50 -f"
echo "3. Test the admin panel at: http://your-domain/admin/login"
echo ""
