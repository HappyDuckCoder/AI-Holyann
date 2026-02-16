# Profile Analysis Migration Script
# Chạy script này để thêm các columns mới vào bảng profile_analyses

Write-Host "🚀 Starting Profile Analysis Database Migration..." -ForegroundColor Cyan

# Option 1: If using Prisma migrations
Write-Host ""
Write-Host "Option 1: Sử dụng Prisma Migration" -ForegroundColor Yellow
Write-Host "Chạy các lệnh sau:" -ForegroundColor White
Write-Host "  npx prisma migrate dev --name add_profile_analysis_fields" -ForegroundColor Green
Write-Host "  npx prisma generate" -ForegroundColor Green

# Option 2: Run SQL directly
Write-Host ""
Write-Host "Option 2: Chạy SQL trực tiếp trên Supabase" -ForegroundColor Yellow
Write-Host "1. Mở Supabase Dashboard > SQL Editor" -ForegroundColor White
Write-Host "2. Copy nội dung file: database/update-profile-analyses.sql" -ForegroundColor White
Write-Host "3. Chạy SQL" -ForegroundColor White

Write-Host ""
Write-Host "📋 Các columns mới sẽ được thêm:" -ForegroundColor Cyan
Write-Host "  - input_data (JSONB): Dữ liệu input gửi đến AI" -ForegroundColor Gray
Write-Host "  - full_result (JSONB): Kết quả đầy đủ từ AI" -ForegroundColor Gray
Write-Host "  - score_aca, score_lan, score_hdnk, score_skill (Float): Điểm 4 trụ cột" -ForegroundColor Gray
Write-Host "  - score_usa, score_asia, score_europe (Float): Điểm theo khu vực" -ForegroundColor Gray
Write-Host "  - main_spike (String): Loại Spike chính" -ForegroundColor Gray
Write-Host "  - spike_sharpness (String): Độ sắc của Spike" -ForegroundColor Gray
Write-Host "  - spike_score (Float): Điểm Spike" -ForegroundColor Gray
Write-Host "  - all_spike_scores (JSONB): Điểm tất cả 12 loại Spike" -ForegroundColor Gray

Write-Host ""
Write-Host "⚠️ Sau khi chạy migration, nhớ:" -ForegroundColor Yellow
Write-Host "  1. npx prisma generate - để cập nhật Prisma Client" -ForegroundColor White
Write-Host "  2. Restart dev server - npm run dev" -ForegroundColor White

Write-Host ""
Write-Host "✅ Migration script completed!" -ForegroundColor Green
