# Start Application Guide

## Quick Start

### Option 1: Run with Maven
```powershell
cd C:\Users\rajes\IdeaProjects\JTS
mvn spring-boot:run
```

### Option 2: Run JAR directly
```powershell
cd C:\Users\rajes\IdeaProjects\JTS
java -jar target\jts-application-1.0.0.jar
```

## Access Application
Once started, open your browser and navigate to:
- **Home Page**: http://localhost:8080/
- **Services Page**: http://localhost:8080/services

## Verify Images
After starting the application:
1. Open the home page - the banner should load
2. Navigate to the services page - the banner and all service images should load
3. If images don't appear, press `Ctrl+Shift+R` or `Ctrl+F5` to hard refresh and clear cache

## Troubleshooting
If images still don't load:
1. Check the console/logs for errors
2. Verify the application is running on the expected port (default: 8080)
3. Check if any static resource configuration is overriding the defaults
4. Ensure all files in `src/main/resources/static/` are properly copied to `target/classes/static/`

## What Was Fixed
- ✅ Banner fragment now accepts custom image source parameters
- ✅ Home page uses correct tablet banner image (`tab home.png`)
- ✅ Services page uses correct banner images
- ✅ All service card images properly referenced
- ✅ Project successfully compiled and packaged

See `IMAGE_FIX_SUMMARY.md` for detailed fix information.

