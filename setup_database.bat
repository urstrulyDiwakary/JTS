@echo off
echo 🔧 Setting up JTS Database...

REM Database connection parameters
set DB_NAME=JTS
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo 📊 Adding required columns to users table...

REM Create temporary SQL file
echo ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20); > temp_setup.sql
echo ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100); >> temp_setup.sql
echo ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active'; >> temp_setup.sql
echo ALTER TABLE users ADD COLUMN IF NOT EXISTS mustchangepassword BOOLEAN DEFAULT TRUE; >> temp_setup.sql
echo. >> temp_setup.sql
echo INSERT INTO users (username, email, password, role, status, mustchangepassword) >> temp_setup.sql
echo VALUES ('admin', 'admin@admin.com', 'admin', 'ADMIN', 'Active', FALSE) >> temp_setup.sql
echo ON CONFLICT (username) DO NOTHING; >> temp_setup.sql
echo. >> temp_setup.sql
echo SELECT column_name, data_type, is_nullable >> temp_setup.sql
echo FROM information_schema.columns >> temp_setup.sql
echo WHERE table_name = 'users' >> temp_setup.sql
echo ORDER BY ordinal_position; >> temp_setup.sql

REM Execute the SQL
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f temp_setup.sql

if %ERRORLEVEL% EQU 0 (
    echo ✅ Database setup completed successfully!
    echo 🚀 You can now start your JTS application:
    echo    mvn spring-boot:run
    echo.
    echo 🔐 Login at: http://localhost:8000/admin/login
    echo    Username: admin
    echo    Password: admin
) else (
    echo ❌ Database setup failed. Please check:
    echo    1. PostgreSQL is running
    echo    2. Database 'JTS' exists
    echo    3. User 'postgres' has access
    echo    4. Connection parameters are correct
)

REM Clean up
del temp_setup.sql

pause
