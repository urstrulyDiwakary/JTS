# Test Contact Form Fix
Write-Host '🧪 Testing Contact Form Fix - 400 Bad Request Issue' -ForegroundColor Cyan
# Configuration
$baseUrl = 'http://localhost:8088'
$contactApiUrl = "$baseUrl/api/contact"
Write-Host '
📋 Test 1: Submitting with ONLY required fields (this was failing before)...' -ForegroundColor Yellow
$testData = @{
    name = 'Test User'
    email = ''
    phone = '+91 9876543210'
    subject = ''
    service = 'web-development'
    message = ''
} | ConvertTo-Json
try {
    $response = Invoke-RestMethod -Uri $contactApiUrl -Method POST -Body $testData -ContentType 'application/json'
    Write-Host '✅ Test PASSED: $($response.message)' -ForegroundColor Green
    Write-Host '   The 400 Bad Request issue is FIXED!' -ForegroundColor Cyan
} catch {
    Write-Host '❌ Test FAILED: $($_.Exception.Message)' -ForegroundColor Red
}
Write-Host '
Make sure the application is running on $baseUrl' -ForegroundColor Yellow
