@echo off
REM JTS Application Production Build Script for Windows
REM This script builds the application for production deployment

echo.
echo ==============================================
echo   JTS Application Production Build
echo ==============================================
echo.

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Maven is not installed. Please install Maven first.
    exit /b 1
)

echo [INFO] Cleaning previous builds...
call mvn clean

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Clean failed
    exit /b 1
)

echo [INFO] Building application...
call mvn package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    exit /b 1
)

echo.
echo ==============================================
echo   Build Successful!
echo ==============================================
echo.
echo JAR file created in: target\jts-application-1.0.0.jar
echo.
echo Next steps:
echo 1. Test locally:
echo    java -jar target\jts-application-1.0.0.jar --spring.profiles.active=prod
echo.
echo 2. Upload to VPS using SCP or SFTP
echo.
echo 3. Follow deployment-guide.md for complete deployment
echo.
echo ==============================================
pause

