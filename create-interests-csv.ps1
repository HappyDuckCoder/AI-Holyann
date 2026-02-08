# Script tự động tạo file interests.csv cho Django AI Server
# Run this script from any directory

Write-Host "`n🎯 Creating interests.csv for Django AI Server..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Define target directory
$targetDir = "D:\server-ai\holyann\hoexapp\module\feature2\config"
$targetFile = Join-Path $targetDir "interests.csv"

# Create directory if not exists
if (-not (Test-Path $targetDir)) {
    Write-Host "`n📁 Creating directory: $targetDir" -ForegroundColor Yellow
    try {
        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
        Write-Host "✅ Directory created successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create directory: $_" -ForegroundColor Red
        Write-Host "`nPlease create the directory manually or run PowerShell as Administrator" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "`n✅ Directory already exists: $targetDir" -ForegroundColor Green
}

# CSV content
$csvContent = @"
interest_code,interest_name,description,characteristics,suitable_careers,work_environment
R,Realistic (Thực tế),"Người thuộc nhóm Realistic thích làm việc với đồ vật, máy móc, dụng cụ, động vật hoặc làm việc ngoài trời. Họ thường thích các hoạt động thực tế, cụ thể và có kết quả hữu hình.","Thực tế, độc lập, bền bỉ, thẳng thắn, kiên nhẫn, giỏi kỹ thuật, thích làm việc bằng tay","Kỹ sư cơ khí;Thợ điện;Kỹ thuật viên;Kiến trúc sư;Thợ xây;Nông dân;Thợ sửa chữa;Phi công","Nhà máy, xưởng sản xuất, công trường, ngoài trời, phòng thí nghiệm kỹ thuật"
I,Investigative (Nghiên cứu),"Người thuộc nhóm Investigative thích quan sát, học hỏi, điều tra, phân tích, đánh giá và giải quyết vấn đề. Họ có xu hướng tư duy logic, phân tích và thích khám phá tri thức.","Trí tuệ, tò mò, phân tích, độc lập, logic, tư duy phản biện, yêu thích nghiên cứu","Nhà khoa học;Bác sĩ;Nhà nghiên cứu;Nhà toán học;Dược sĩ;Kỹ sư phần mềm;Nhà phân tích dữ liệu;Nhà sinh học","Phòng thí nghiệm, viện nghiên cứu, bệnh viện, trường đại học, văn phòng nghiên cứu"
A,Artistic (Nghệ thuật),"Người thuộc nhóm Artistic thích làm việc trong môi trường không có cấu trúc rõ ràng, nơi họ có thể sử dụng sự sáng tạo và trí tưởng tượng. Họ đánh giá cao tính thẩm mỹ và sự thể hiện cá nhân.","Sáng tạo, giàu trí tưởng tượng, độc đáo, tự do, cảm xúc, nghệ sĩ, khác biệt, thẩm mỹ","Họa sĩ;Nhà thiết kế;Nhạc sĩ;Diễn viên;Nhà văn;Nhiếp ảnh gia;Kiến trúc sư nội thất;Đạo diễn phim","Studio nghệ thuật, sân khấu, văn phòng thiết kế, không gian sáng tạo, freelance"
S,Social (Xã hội),"Người thuộc nhóm Social thích làm việc với con người để giúp đỡ, dạy dỗ, chăm sóc hoặc hướng dẫn họ. Họ có xu hướng quan tâm đến phúc lợi của người khác và thích giao tiếp.","Thân thiện, hợp tác, kiên nhẫn, đồng cảm, giao tiếp tốt, quan tâm người khác, nhân văn","Giáo viên;Y tá;Tư vấn viên;Nhà tâm lý học;Công tác xã hội;Nhân viên nhân sự;Huấn luyện viên;Chuyên gia trị liệu","Trường học, bệnh viện, tổ chức phi lợi nhuận, văn phòng tư vấn, cộng đồng"
E,Enterprising (Kinh doanh),"Người thuộc nhóm Enterprising thích dẫn dắt, thuyết phục, quản lý và tổ chức để đạt được mục tiêu tổ chức hoặc lợi ích kinh tế. Họ có xu hướng năng động, tự tin và có tham vọng.","Tự tin, tham vọng, năng động, thuyết phục, dám chấp nhận rủi ro, lãnh đạo, ngoại hướng","Doanh nhân;Giám đốc điều hành;Nhà quản lý;Nhân viên bán hàng;Luật sư;Chính trị gia;Marketing Manager;Đại diện kinh doanh","Văn phòng công ty, môi trường kinh doanh, phòng họp, sự kiện networking, startup"
C,Conventional (Truyền thống),"Người thuộc nhóm Conventional thích làm việc với dữ liệu, số liệu, theo quy trình và hệ thống có tổ chức rõ ràng. Họ đánh giá cao sự chính xác, trật tự và quy tắc.","Có tổ chức, cẩn thận, chính xác, đáng tin cậy, tuân thủ quy tắc, tỉ mỉ, có trách nhiệm","Kế toán;Thư ký;Nhân viên hành chính;Kiểm toán viên;Nhân viên ngân hàng;Quản lý hồ sơ;Data Entry;Chuyên viên thuế","Văn phòng có cấu trúc, ngân hàng, công ty kế toán, cơ quan chính phủ, môi trường ổn định"
"@

# Write file
Write-Host "`n📝 Writing interests.csv..." -ForegroundColor Yellow
try {
    $csvContent | Out-File -FilePath $targetFile -Encoding UTF8 -NoNewline
    Write-Host "✅ File created successfully at: $targetFile" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create file: $_" -ForegroundColor Red
    exit 1
}

# Verify file
Write-Host "`n🔍 Verifying file..." -ForegroundColor Yellow
if (Test-Path $targetFile) {
    $fileInfo = Get-Item $targetFile
    $lineCount = (Get-Content $targetFile).Count

    Write-Host "✅ File exists" -ForegroundColor Green
    Write-Host "   Path: $($fileInfo.FullName)" -ForegroundColor Gray
    Write-Host "   Size: $($fileInfo.Length) bytes" -ForegroundColor Gray
    Write-Host "   Lines: $lineCount (expected: 7)" -ForegroundColor Gray

    if ($lineCount -eq 7) {
        Write-Host "✅ Line count is correct!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Expected 7 lines but found $lineCount" -ForegroundColor Yellow
    }

    # Show first 3 lines
    Write-Host "`n📄 First 3 lines of the file:" -ForegroundColor Cyan
    Get-Content $targetFile -TotalCount 3 | ForEach-Object {
        $line = $_ -replace '^(.{100}).*','$1...'  # Truncate long lines
        Write-Host "   $line" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ File not found after creation!" -ForegroundColor Red
    exit 1
}

# Next steps
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "🎉 interests.csv created successfully!" -ForegroundColor Green

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart Django server:" -ForegroundColor White
Write-Host "   cd <django-project-dir>" -ForegroundColor Gray
Write-Host "   python manage.py runserver 127.0.0.1:8000" -ForegroundColor Gray

Write-Host "`n2. Test the API:" -ForegroundColor White
Write-Host "   curl -X POST http://127.0.0.1:8000/hoexapp/api/career-assessment/ \" -ForegroundColor Gray
Write-Host "     -H `"Content-Type: application/json`" \" -ForegroundColor Gray
Write-Host "     -d `"{...}`"" -ForegroundColor Gray

Write-Host "`n3. Test from Next.js:" -ForegroundColor White
Write-Host "   - Open: http://localhost:3000/student/tests" -ForegroundColor Gray
Write-Host "   - Click: 'Xem kết quả phân tích AI'" -ForegroundColor Gray

Write-Host "`n💡 Tip: Backup this file for future use!" -ForegroundColor Yellow
Write-Host "   copy `"$targetFile`" `"$targetFile.backup`"" -ForegroundColor Gray

Write-Host ""
