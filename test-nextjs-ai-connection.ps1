# Test Next.js to AI Server Connection
# Make sure Next.js dev server is running on port 3000

Write-Host "`n🔍 Testing Next.js → AI Server Connection..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Check if Next.js is running
Write-Host "`n📡 Checking if Next.js is running on port 3000..." -ForegroundColor Yellow
$port3000 = netstat -an | Select-String "3000"
if ($port3000) {
    Write-Host "✅ Port 3000 is open" -ForegroundColor Green
} else {
    Write-Host "❌ Port 3000 is NOT open. Next.js might not be running!" -ForegroundColor Red
    Write-Host "Please run: npm run dev" -ForegroundColor Yellow
    exit
}

# Test Next.js health
Write-Host "`n🌐 Testing Next.js server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Next.js is responding (status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to connect to Next.js:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit
}

# Test AI connection endpoint
Write-Host "`n🔌 Testing AI connection test endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/test-ai-connection" -Method GET -TimeoutSec 30 -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Test endpoint responded!" -ForegroundColor Green
    Write-Host "`n📊 Results:" -ForegroundColor Cyan
    Write-Host "AI Server URL: $($data.aiServerUrl)" -ForegroundColor White
    Write-Host "Total tests: $($data.summary.total)" -ForegroundColor White
    Write-Host "Passed: $($data.summary.passed)" -ForegroundColor Green
    Write-Host "Failed: $($data.summary.failed)" -ForegroundColor Red
    
    Write-Host "`n📋 Details:" -ForegroundColor Cyan
    foreach ($result in $data.results) {
        if ($result.success) {
            Write-Host "  ✅ $($result.test): Status $($result.status)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($result.test): $($result.error)" -ForegroundColor Red
        }
    }
    
    # Overall status
    if ($data.summary.failed -eq 0) {
        Write-Host "`n🎉 All tests passed! AI server is connected." -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Some tests failed. Check Django server." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Failed to call test endpoint:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "🏁 Test completed!" -ForegroundColor Cyan
Write-Host ""
