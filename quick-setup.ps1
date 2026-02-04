# Quick Setup Script for Checklist Module
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CHECKLIST MODULE - QUICK SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill Node processes
Write-Host "[1/5] " -NoNewline -ForegroundColor Yellow
Write-Host "Stopping existing Node processes..."
taskkill /F /IM node.exe /T 2>$null | Out-Null
Start-Sleep -Seconds 2
Write-Host "      ✅ Done!" -ForegroundColor Green

# Step 2: Clear cache
Write-Host ""
Write-Host "[2/5] " -NoNewline -ForegroundColor Yellow
Write-Host "Clearing Next.js build cache..."
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "      ✅ Done!" -ForegroundColor Green

# Step 3: Regenerate Prisma Client
Write-Host ""
Write-Host "[3/5] " -NoNewline -ForegroundColor Yellow
Write-Host "Regenerating Prisma Client..."
npx prisma generate --silent 2>$null | Out-Null
Write-Host "      ✅ Done!" -ForegroundColor Green

# Step 4: Start dev server
Write-Host ""
Write-Host "[4/5] " -NoNewline -ForegroundColor Yellow
Write-Host "Starting development server..."
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev"
Write-Host "      ⏳ Waiting for server to start (15 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 15
Write-Host "      ✅ Server started!" -ForegroundColor Green

# Step 5: Seed database
Write-Host ""
Write-Host "[5/5] " -NoNewline -ForegroundColor Yellow
Write-Host "Seeding database with checklist data..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/seed-checklist" -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json

    if ($result.success) {
        Write-Host "      ✅ Database seeded successfully!" -ForegroundColor Green
        Write-Host "      📊 Stages: " -NoNewline -ForegroundColor Gray
        Write-Host $result.data.stages -ForegroundColor White
        Write-Host "      📋 Tasks: " -NoNewline -ForegroundColor Gray
        Write-Host $result.data.tasks -ForegroundColor White
    } else {
        Write-Host "      ⚠️  Seed response: $($result.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "      ⚠️  Could not seed database. Server might not be ready yet." -ForegroundColor Yellow
    Write-Host "      💡 You can manually seed by visiting: http://localhost:3000/api/seed-checklist" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ✨ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Open your browser and go to:" -ForegroundColor White
Write-Host "   http://localhost:3000/student/checklist" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 For more info, check:" -ForegroundColor White
Write-Host "   - TEST_CHECKLIST.md" -ForegroundColor Gray
Write-Host "   - CHECKLIST_DB_SYNC_SUMMARY.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
