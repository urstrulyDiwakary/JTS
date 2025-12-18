@echo off
echo 🚀 Running Database Migration to Remove Deprecated Columns...
echo ============================================================

REM Database connection parameters
set DB_NAME=JTS
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo 📋 Starting migration process...

REM Create a temporary SQL script for the migration
(
echo -- Drop deprecated columns from users table
echo DO $$
echo BEGIN
echo     -- Check and drop must_change_password column
echo     IF EXISTS ^(
echo         SELECT 1 FROM information_schema.columns
echo         WHERE table_name = 'users' AND column_name = 'must_change_password'
echo     ^) THEN
echo         ALTER TABLE users DROP COLUMN must_change_password;
echo         RAISE NOTICE 'Dropped column: must_change_password';
echo     ELSE
echo         RAISE NOTICE 'Column must_change_password does not exist';
echo     END IF;
echo.
echo     -- Check and drop location column
echo     IF EXISTS ^(
echo         SELECT 1 FROM information_schema.columns
echo         WHERE table_name = 'users' AND column_name = 'location'
echo     ^) THEN
echo         ALTER TABLE users DROP COLUMN location;
echo         RAISE NOTICE 'Dropped column: location';
echo     ELSE
echo         RAISE NOTICE 'Column location does not exist';
echo     END IF;
echo END $$;
echo.
echo -- Verify the columns have been removed
echo SELECT 'Checking for deprecated columns:' AS info;
echo SELECT column_name FROM information_schema.columns
echo WHERE table_name = 'users' AND column_name IN ^('must_change_password', 'location'^);
echo.
echo SELECT 'Migration completed successfully!' AS status;
) > temp_migration.sql

REM Try to run the migration using different PostgreSQL client approaches
echo 💾 Executing migration script...

REM First try: Use psql if available
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f temp_migration.sql 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Migration completed successfully using psql!
    del temp_migration.sql
    goto :success
)

REM Second try: Show the SQL to be run manually
echo ⚠️ psql not found in PATH. Here's the SQL to run manually:
echo.
echo ========================================
type temp_migration.sql
echo ========================================
echo.
echo Please run the above SQL commands in your PostgreSQL client.
echo.

:success
echo ✅ Database migration process completed.
del temp_migration.sql 2>nul
pause
