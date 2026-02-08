# Test AI Server Connection Script
# Run this to quickly check if AI server is accessible

Write-Host "`n🔍 Testing AI Server Connection..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Check if port 8000 is listening
Write-Host "`n📡 Checking if port 8000 is open..." -ForegroundColor Yellow
$port8000 = netstat -an | Select-String "8000"
if ($port8000) {
    Write-Host "✅ Port 8000 is open:" -ForegroundColor Green
    Write-Host $port8000
} else {
    Write-Host "❌ Port 8000 is NOT open. Django server might not be running!" -ForegroundColor Red
}

# Test root endpoint
Write-Host "`n🌐 Testing root endpoint (http://127.0.0.1:8000/)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Root endpoint responded with status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response (first 200 chars):" -ForegroundColor Gray
    Write-Host $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
} catch {
    Write-Host "❌ Failed to connect to root endpoint:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test career assessment endpoint
Write-Host "`n🎯 Testing career assessment endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    $body = '{"mbti_answers": [1,2,3], "grit_answers": {}, "riasec_answers": {}}'
    
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/hoexapp/api/career-assessment/" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -TimeoutSec 5 `
        -ErrorAction Stop
        
    Write-Host "✅ Career assessment endpoint responded with status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 422) {
        Write-Host "⚠️  Endpoint is reachable but returned error $statusCode (expected for test data)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to connect:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Check Django process
Write-Host "`n🐍 Checking for Django/Python processes..." -ForegroundColor Yellow
$pythonProcesses = Get-Process -Name python* -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    Write-Host "✅ Found Python processes:" -ForegroundColor Green
    $pythonProcesses | Select-Object Id, ProcessName, Path | Format-Table
} else {
    Write-Host "❌ No Python processes found. Django might not be running!" -ForegroundColor Red
}

# Check environment variable
Write-Host "`n🔧 Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" | Select-String "AI_SERVER_URL"
    if ($envContent) {
        Write-Host "✅ Found AI_SERVER_URL in .env:" -ForegroundColor Green
        Write-Host $envContent
    } else {
        Write-Host "❌ AI_SERVER_URL not found in .env!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
}

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "🏁 Test completed!" -ForegroundColor Cyan

# Summary
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "- If port 8000 is NOT open → Start Django server" -ForegroundColor White
Write-Host "- If endpoints don't respond → Check Django server logs" -ForegroundColor White
Write-Host "- If Python processes not found → Django server is not running" -ForegroundColor White
Write-Host "`nTo start Django server, run:" -ForegroundColor Yellow
Write-Host "  cd <django-project-path>" -ForegroundColor Gray
Write-Host "  python manage.py runserver 127.0.0.1:8000" -ForegroundColor Gray
Write-Host ""
