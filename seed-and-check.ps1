# Script to seed checklist data
Write-Host "🌱 Seeding checklist data..." -ForegroundColor Green
npx tsx seed-checklist-sample.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Seed completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Checking seeded data..." -ForegroundColor Cyan
    npx tsx check-checklist-data.ts
} else {
    Write-Host "❌ Seed failed!" -ForegroundColor Red
}
