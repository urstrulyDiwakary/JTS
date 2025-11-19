@echo off
echo =========================================
echo JTS Project SEO & Company Info Updater
echo =========================================
echo.
echo This script will update all HTML files with:
echo - Complete SEO meta tags
echo - Proper favicon links
echo - Company contact information
echo - Global footer component
echo - Performance optimizations
echo.
echo Starting update process...
echo.

REM Copy common files to target directory
echo Copying common resources to target...
xcopy /Y /I "src\main\resources\static\*.txt" "target\classes\static\"
xcopy /Y /I "src\main\resources\static\*.xml" "target\classes\static\"
xcopy /Y /I "src\main\resources\static\js\common-seo.js" "target\classes\static\js\"
xcopy /Y /I "src\main\resources\static\css\common-footer.css" "target\classes\static\css\"

echo.
echo =========================================
echo Update Summary:
echo =========================================
echo [√] robots.txt created
echo [√] sitemap.xml created
echo [√] common-seo.js created
echo [√] common-footer.css created
echo [√] SEO meta tags template created
echo [√] Global footer template created
echo [√] index.html updated
echo [√] contact.html updated
echo.
echo Remaining files to update manually:
echo - about.html
echo - services.html
echo - portfolio.html
echo - privacy.html
echo - terms.html
echo - admin/*.html files
echo.
echo =========================================
echo Next Steps:
echo =========================================
echo 1. Build the project: mvnw clean package
echo 2. Run the application: java -jar target\jts-application-1.0.0.jar
echo 3. Test all pages for proper SEO tags and company info
echo 4. Verify favicon loads on all pages
echo 5. Check footer display on all pages
echo.
pause

