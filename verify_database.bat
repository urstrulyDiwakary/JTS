@echo off
echo 🔍 Checking JTS Database Setup...
echo ==================================

REM Database connection parameters
set DB_NAME=JTS
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo 📋 Checking if database and table exist...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT 'Database connected successfully!' as status;"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Cannot connect to database. Please check:
    echo    1. PostgreSQL is running
    echo    2. Database 'JTS' exists
    echo    3. Connection parameters are correct
    pause
    exit /b 1
)

echo.
echo 📊 Current users table structure:
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"

echo.
echo 👥 Current users in database:
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT username, email, role, status FROM users;"

echo.
echo 🔧 Checking for required columns...
echo    (Check the output above to see if all columns exist)

echo.
echo 🚀 To fix missing columns, run:
echo    psql -U %DB_USER% -d %DB_NAME% -f complete_database_fix.sql

pause
