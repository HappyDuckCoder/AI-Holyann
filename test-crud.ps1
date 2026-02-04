# Script test CRUD nhanh cho tasks
Write-Host "🎯 CRUD Test Script for Tasks" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/tasks"

Write-Host "📝 Test 1: Tạo task mới..." -ForegroundColor Yellow
$createBody = @{
    stage_id = 1
    title = "Test Task - PowerShell Created"
    description = "Task được tạo từ PowerShell script để test CRUD"
    link_to = "/dashboard/profile"
} | ConvertTo-Json

try {
    $createResult = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $createBody
    if ($createResult.success) {
        Write-Host "✅ Tạo task thành công!" -ForegroundColor Green
        Write-Host "   Task ID: $($createResult.data.id)" -ForegroundColor Gray
        $taskId = $createResult.data.id
    } else {
        Write-Host "❌ Lỗi: $($createResult.error)" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ Không thể kết nối API. Đảm bảo server đang chạy (npm run dev)" -ForegroundColor Red
    exit
}

Write-Host "`n📖 Test 2: Đọc tất cả tasks..." -ForegroundColor Yellow
try {
    $readResult = Invoke-RestMethod -Uri $baseUrl -Method GET
    Write-Host "✅ Đọc thành công! Tổng tasks: $($readResult.count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Lỗi đọc tasks" -ForegroundColor Red
}

Write-Host "`n✏️ Test 3: Cập nhật task..." -ForegroundColor Yellow
$updateBody = @{
    id = $taskId
    title = "Test Task - UPDATED by PowerShell"
    description = "Task đã được cập nhật qua script"
} | ConvertTo-Json

try {
    $updateResult = Invoke-RestMethod -Uri $baseUrl -Method PUT -ContentType "application/json" -Body $updateBody
    if ($updateResult.success) {
        Write-Host "✅ Cập nhật thành công!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Lỗi cập nhật task" -ForegroundColor Red
}

Write-Host "`n🗑️ Test 4: Xóa task..." -ForegroundColor Yellow
Write-Host "   (Đợi 2 giây trước khi xóa...)" -ForegroundColor Gray
Start-Sleep -Seconds 2

try {
    $deleteResult = Invoke-RestMethod -Uri "$baseUrl?id=$taskId" -Method DELETE
    if ($deleteResult.success) {
        Write-Host "✅ Xóa thành công!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Lỗi xóa task" -ForegroundColor Red
}

Write-Host "`n====================================`n" -ForegroundColor Cyan
Write-Host "🎉 Test CRUD hoàn tất!" -ForegroundColor Green
Write-Host "`n📊 Bây giờ mở trình duyệt để test UI:" -ForegroundColor Cyan
Write-Host "   Task Manager: http://localhost:3000/task-manager.html" -ForegroundColor White
Write-Host "   Checklist Page: http://localhost:3000/student/checklist" -ForegroundColor White
