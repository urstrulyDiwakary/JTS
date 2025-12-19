# Test Contact Form API Integration
Write-Host "🔧 Testing Contact Form API Integration..." -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:8000"
$contactApiUrl = "$baseUrl/api/contact"
$adminApiUrl = "$baseUrl/api/contact/admin/submissions"

# Test data for contact form
$testContactData = @{
    name = "Integration Test User"
    email = "test.integration@jestatech.com"
    phone = "+91 9876543210"
    subject = "API Integration Test"
    service = "web-development"
    message = "This is an automated test to verify that contact form submissions are properly saved and can be retrieved through the admin API."
} | ConvertTo-Json

Write-Host "`n📝 Step 1: Testing Contact Form Submission..." -ForegroundColor Yellow

try {
    $contactResponse = Invoke-RestMethod -Uri $contactApiUrl -Method POST -Body $testContactData -ContentType "application/json"
    Write-Host "✅ Contact Form Submission SUCCESSFUL" -ForegroundColor Green
    Write-Host "Status: $($contactResponse.status)" -ForegroundColor White
    Write-Host "Message: $($contactResponse.message)" -ForegroundColor White
}
catch {
    Write-Host "❌ Contact Form Submission FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red

    # Check if application is running
    try {
        $healthCheck = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "✅ Application is responding on $baseUrl" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Application is NOT running on $baseUrl" -ForegroundColor Red
        Write-Host "Please start the application first using: java -jar target\jts-application-1.0.0.jar" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n📋 Step 2: Testing Admin API (Checking Submissions)..." -ForegroundColor Yellow

try {
    $adminResponse = Invoke-RestMethod -Uri $adminApiUrl -Method GET
    Write-Host "✅ Admin API Response SUCCESSFUL" -ForegroundColor Green
    Write-Host "Total submissions found: $($adminResponse.Count)" -ForegroundColor White

    if ($adminResponse.Count -eq 0) {
        Write-Host "⚠️  WARNING: No submissions found in admin panel!" -ForegroundColor Red
        Write-Host "This could indicate:" -ForegroundColor Yellow
        Write-Host "  1. Database not properly configured" -ForegroundColor Yellow
        Write-Host "  2. Contact form submissions not being saved" -ForegroundColor Yellow
        Write-Host "  3. Admin API returning wrong data" -ForegroundColor Yellow
    } else {
        Write-Host "`n📊 Recent Submissions:" -ForegroundColor Green
        foreach ($submission in $adminResponse[0..2]) {  # Show first 3 submissions
            Write-Host "  • Name: $($submission.name)" -ForegroundColor White
            Write-Host "    Email: $($submission.email)" -ForegroundColor Gray
            Write-Host "    Subject: $($submission.subject)" -ForegroundColor Gray
            Write-Host "    Created: $($submission.createdAt)" -ForegroundColor Gray
            Write-Host "    Read: $($submission.read)" -ForegroundColor Gray
            Write-Host ""
        }

        # Check if our test submission appears in the list
        $testSubmission = $adminResponse | Where-Object { $_.email -eq "test.integration@jestatech.com" -and $_.subject -eq "API Integration Test" }
        if ($testSubmission) {
            Write-Host "✅ SUCCESS: Test submission found in admin panel!" -ForegroundColor Green
            Write-Host "The contact form is working correctly - data flows from frontend to backend to admin panel." -ForegroundColor Green
        } else {
            Write-Host "⚠️  WARNING: Test submission NOT found in admin panel!" -ForegroundColor Red
            Write-Host "This indicates there might be a timing issue or the data is not being saved properly." -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "❌ Admin API Request FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "The admin API might require authentication or have other issues." -ForegroundColor Yellow
}

Write-Host "`n🔍 Step 3: Database Connection Check..." -ForegroundColor Yellow

# Check if PostgreSQL is accessible (indirect test)
try {
    # Try to access an admin endpoint that would require database
    $testDbUrl = "$baseUrl/api/contact/admin/submissions/stats"
    $statsResponse = Invoke-RestMethod -Uri $testDbUrl -Method GET -ErrorAction SilentlyContinue
    Write-Host "✅ Database connection appears to be working" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Database connection test failed" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check PostgreSQL service and database configuration in application.properties" -ForegroundColor Yellow
}

Write-Host "`n📝 Summary and Recommendations:" -ForegroundColor Cyan
Write-Host "1. Open the admin forms page: $baseUrl/admin/forms" -ForegroundColor White
Write-Host "2. Test the public contact page: $baseUrl/contact" -ForegroundColor White
Write-Host "3. Check application logs for any database errors" -ForegroundColor White
Write-Host "4. Verify PostgreSQL is running and accessible" -ForegroundColor White

Write-Host "`n🎯 Test Complete!" -ForegroundColor Green
