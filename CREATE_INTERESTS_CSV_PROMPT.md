# 📝 Prompt để tạo file interests.csv cho Django AI Server

## 🎯 Mục đích
Tạo file `interests.csv` chứa dữ liệu về các loại hứng thú nghề nghiệp theo mô hình RIASEC (Holland Code) cho hệ thống phân tích nghề nghiệp.

---

## 📍 Vị trí file
```
D:\server-ai\holyann\hoexapp\module\feature2\config\interests.csv
```

---

## 📋 Format file CSV

### Cấu trúc cột:
```csv
interest_code,interest_name,description,characteristics,suitable_careers,work_environment
```

### Mô tả từng cột:

| Cột | Kiểu dữ liệu | Mô tả | Bắt buộc |
|-----|--------------|-------|----------|
| `interest_code` | String (1 char) | Mã RIASEC: R, I, A, S, E, C | ✅ Bắt buộc |
| `interest_name` | String | Tên tiếng Việt của loại hứng thú | ✅ Bắt buộc |
| `description` | String | Mô tả chi tiết về loại hứng thú này | ✅ Bắt buộc |
| `characteristics` | String | Đặc điểm tính cách người thuộc nhóm này | Tùy chọn |
| `suitable_careers` | String | Ví dụ các nghề phù hợp (phân cách bởi `;`) | Tùy chọn |
| `work_environment` | String | Môi trường làm việc phù hợp | Tùy chọn |

---

## 📄 Template file interests.csv

```csv
interest_code,interest_name,description,characteristics,suitable_careers,work_environment
R,Realistic (Thực tế),"Người thuộc nhóm Realistic thích làm việc với đồ vật, máy móc, dụng cụ, động vật hoặc làm việc ngoài trời. Họ thường thích các hoạt động thực tế, cụ thể và có kết quả hữu hình.","Thực tế, độc lập, bền bỉ, thẳng thắn, kiên nhẫn, giỏi kỹ thuật, thích làm việc bằng tay","Kỹ sư cơ khí;Thợ điện;Kỹ thuật viên;Kiến trúc sư;Thợ xây;Nông dân;Thợ sửa chữa;Phi công","Nhà máy, xưởng sản xuất, công trường, ngoài trời, phòng thí nghiệm kỹ thuật"
I,Investigative (Nghiên cứu),"Người thuộc nhóm Investigative thích quan sát, học hỏi, điều tra, phân tích, đánh giá và giải quyết vấn đề. Họ có xu hướng tư duy logic, phân tích và thích khám phá tri thức.","Trí tuệ, tò mò, phân tích, độc lập, logic, tư duy phản biện, yêu thích nghiên cứu","Nhà khoa học;Bác sĩ;Nhà nghiên cứu;Nhà toán học;Dược sĩ;Kỹ sư phần mềm;Nhà phân tích dữ liệu;Nhà sinh học","Phòng thí nghiệm, viện nghiên cứu, bệnh viện, trường đại học, văn phòng nghiên cứu"
A,Artistic (Nghệ thuật),"Người thuộc nhóm Artistic thích làm việc trong môi trường không có cấu trúc rõ ràng, nơi họ có thể sử dụng sự sáng tạo và trí tưởng tượng. Họ đánh giá cao tính thẩm mỹ và sự thể hiện cá nhân.","Sáng tạo, giàu trí tưởng tượng, độc đáo, tự do, cảm xúc, nghệ sĩ, khác biệt, thẩm mỹ","Họa sĩ;Nhà thiết kế;Nhạc sĩ;Diễn viên;Nhà văn;Nhiếp ảnh gia;Kiến trúc sư nội thất;Đạo diễn phim","Studio nghệ thuật, sân khấu, văn phòng thiết kế, không gian sáng tạo, freelance"
S,Social (Xã hội),"Người thuộc nhóm Social thích làm việc với con người để giúp đỡ, dạy dỗ, chăm sóc hoặc hướng dẫn họ. Họ có xu hướng quan tâm đến phúc lợi của người khác và thích giao tiếp.","Thân thiện, hợp tác, kiên nhẫn, đồng cảm, giao tiếp tốt, quan tâm người khác, nhân văn","Giáo viên;Y tá;Tư vấn viên;Nhà tâm lý học;Công tác xã hội;Nhân viên nhân sự;Huấn luyện viên;Chuyên gia trị liệu","Trường học, bệnh viện, tổ chức phi lợi nhuận, văn phòng tư vấn, cộng đồng"
E,Enterprising (Kinh doanh),"Người thuộc nhóm Enterprising thích dẫn dắt, thuyết phục, quản lý và tổ chức để đạt được mục tiêu tổ chức hoặc lợi ích kinh tế. Họ có xu hướng năng động, tự tin và có tham vọng.","Tự tin, tham vọng, năng động, thuyết phục, dám chấp nhận rủi ro, lãnh đạo, ngoại hướng","Doanh nhân;Giám đốc điều hành;Nhà quản lý;Nhân viên bán hàng;Luật sư;Chính trị gia;Marketing Manager;Đại diện kinh doanh","Văn phòng công ty, môi trường kinh doanh, phòng họp, sự kiện networking, startup"
C,Conventional (Truyền thống),"Người thuộc nhóm Conventional thích làm việc với dữ liệu, số liệu, theo quy trình và hệ thống có tổ chức rõ ràng. Họ đánh giá cao sự chính xác, trật tự và quy tắc.","Có tổ chức, cẩn thận, chính xác, đáng tin cậy, tuân thủ quy tắc, tỉ mỉ, có trách nhiệm","Kế toán;Thư ký;Nhân viên hành chính;Kiểm toán viên;Nhân viên ngân hàng;Quản lý hồ sơ;Data Entry;Chuyên viên thuế","Văn phòng có cấu trúc, ngân hàng, công ty kế toán, cơ quan chính phủ, môi trường ổn định"
```

---

## 🔧 Cách tạo file

### Cách 1: Sử dụng Notepad
```powershell
# 1. Mở Notepad
notepad D:\server-ai\holyann\hoexapp\module\feature2\config\interests.csv

# 2. Copy-paste nội dung template ở trên
# 3. Save file (Ctrl+S)
# 4. Đảm bảo save as "All Files" với encoding UTF-8
```

### Cách 2: Sử dụng PowerShell
```powershell
# Tạo thư mục nếu chưa có
New-Item -Path "D:\server-ai\holyann\hoexapp\module\feature2\config" -ItemType Directory -Force

# Tạo file CSV
@"
interest_code,interest_name,description,characteristics,suitable_careers,work_environment
R,Realistic (Thực tế),"Người thuộc nhóm Realistic thích làm việc với đồ vật, máy móc, dụng cụ, động vật hoặc làm việc ngoài trời. Họ thường thích các hoạt động thực tế, cụ thể và có kết quả hữu hình.","Thực tế, độc lập, bền bỉ, thẳng thắn, kiên nhẫn, giỏi kỹ thuật, thích làm việc bằng tay","Kỹ sư cơ khí;Thợ điện;Kỹ thuật viên;Kiến trúc sư;Thợ xây;Nông dân;Thợ sửa chữa;Phi công","Nhà máy, xưởng sản xuất, công trường, ngoài trời, phòng thí nghiệm kỹ thuật"
I,Investigative (Nghiên cứu),"Người thuộc nhóm Investigative thích quan sát, học hỏi, điều tra, phân tích, đánh giá và giải quyết vấn đề. Họ có xu hướng tư duy logic, phân tích và thích khám phá tri thức.","Trí tuệ, tò mò, phân tích, độc lập, logic, tư duy phản biện, yêu thích nghiên cứu","Nhà khoa học;Bác sĩ;Nhà nghiên cứu;Nhà toán học;Dược sĩ;Kỹ sư phần mềm;Nhà phân tích dữ liệu;Nhà sinh học","Phòng thí nghiệm, viện nghiên cứu, bệnh viện, trường đại học, văn phòng nghiên cứu"
A,Artistic (Nghệ thuật),"Người thuộc nhóm Artistic thích làm việc trong môi trường không có cấu trúc rõ ràng, nơi họ có thể sử dụng sự sáng tạo và trí tưởng tượng. Họ đánh giá cao tính thẩm mỹ và sự thể hiện cá nhân.","Sáng tạo, giàu trí tưởng tượng, độc đáo, tự do, cảm xúc, nghệ sĩ, khác biệt, thẩm mỹ","Họa sĩ;Nhà thiết kế;Nhạc sĩ;Diễn viên;Nhà văn;Nhiếp ảnh gia;Kiến trúc sư nội thất;Đạo diễn phim","Studio nghệ thuật, sân khấu, văn phòng thiết kế, không gian sáng tạo, freelance"
S,Social (Xã hội),"Người thuộc nhóm Social thích làm việc với con người để giúp đỡ, dạy dỗ, chăm sóc hoặc hướng dẫn họ. Họ có xu hướng quan tâm đến phúc lợi của người khác và thích giao tiếp.","Thân thiện, hợp tác, kiên nhẫn, đồng cảm, giao tiếp tốt, quan tâm người khác, nhân văn","Giáo viên;Y tá;Tư vấn viên;Nhà tâm lý học;Công tác xã hội;Nhân viên nhân sự;Huấn luyện viên;Chuyên gia trị liệu","Trường học, bệnh viện, tổ chức phi lợi nhuận, văn phòng tư vấn, cộng đồng"
E,Enterprising (Kinh doanh),"Người thuộc nhóm Enterprising thích dẫn dắt, thuyết phục, quản lý và tổ chức để đạt được mục tiêu tổ chức hoặc lợi ích kinh tế. Họ có xu hướng năng động, tự tin và có tham vọng.","Tự tin, tham vọng, năng động, thuyết phục, dám chấp nhận rủi ro, lãnh đạo, ngoại hướng","Doanh nhân;Giám đốc điều hành;Nhà quản lý;Nhân viên bán hàng;Luật sư;Chính trị gia;Marketing Manager;Đại diện kinh doanh","Văn phòng công ty, môi trường kinh doanh, phòng họp, sự kiện networking, startup"
C,Conventional (Truyền thống),"Người thuộc nhóm Conventional thích làm việc với dữ liệu, số liệu, theo quy trình và hệ thống có tổ chức rõ ràng. Họ đánh giá cao sự chính xác, trật tự và quy tắc.","Có tổ chức, cẩn thận, chính xác, đáng tin cậy, tuân thủ quy tắc, tỉ mỉ, có trách nhiệm","Kế toán;Thư ký;Nhân viên hành chính;Kiểm toán viên;Nhân viên ngân hàng;Quản lý hồ sơ;Data Entry;Chuyên viên thuế","Văn phòng có cấu trúc, ngân hàng, công ty kế toán, cơ quan chính phủ, môi trường ổn định"
"@ | Out-File -FilePath "D:\server-ai\holyann\hoexapp\module\feature2\config\interests.csv" -Encoding UTF8
```

### Cách 3: Sử dụng Excel
```
1. Mở Excel
2. Nhập data theo bảng dưới
3. Save As → CSV (Comma delimited) (*.csv)
4. Lưu vào: D:\server-ai\holyann\hoexapp\module\feature2\config\interests.csv
```

---

## 📊 Data cho Excel (nếu dùng Cách 3)

| interest_code | interest_name | description | characteristics | suitable_careers | work_environment |
|---------------|---------------|-------------|-----------------|------------------|------------------|
| R | Realistic (Thực tế) | Người thuộc nhóm Realistic thích làm việc với đồ vật, máy móc, dụng cụ, động vật hoặc làm việc ngoài trời. Họ thường thích các hoạt động thực tế, cụ thể và có kết quả hữu hình. | Thực tế, độc lập, bền bỉ, thẳng thắn, kiên nhẫn, giỏi kỹ thuật, thích làm việc bằng tay | Kỹ sư cơ khí;Thợ điện;Kỹ thuật viên;Kiến trúc sư;Thợ xây;Nông dân;Thợ sửa chữa;Phi công | Nhà máy, xưởng sản xuất, công trường, ngoài trời, phòng thí nghiệm kỹ thuật |
| I | Investigative (Nghiên cứu) | Người thuộc nhóm Investigative thích quan sát, học hỏi, điều tra, phân tích, đánh giá và giải quyết vấn đề. Họ có xu hướng tư duy logic, phân tích và thích khám phá tri thức. | Trí tuệ, tò mò, phân tích, độc lập, logic, tư duy phản biện, yêu thích nghiên cứu | Nhà khoa học;Bác sĩ;Nhà nghiên cứu;Nhà toán học;Dược sĩ;Kỹ sư phần mềm;Nhà phân tích dữ liệu;Nhà sinh học | Phòng thí nghiệm, viện nghiên cứu, bệnh viện, trường đại học, văn phòng nghiên cứu |
| A | Artistic (Nghệ thuật) | Người thuộc nhóm Artistic thích làm việc trong môi trường không có cấu trúc rõ ràng, nơi họ có thể sử dụng sự sáng tạo và trí tưởng tượng. Họ đánh giá cao tính thẩm mỹ và sự thể hiện cá nhân. | Sáng tạo, giàu trí tưởng tượng, độc đáo, tự do, cảm xúc, nghệ sĩ, khác biệt, thẩm mỹ | Họa sĩ;Nhà thiết kế;Nhạc sĩ;Diễn viên;Nhà văn;Nhiếp ảnh gia;Kiến trúc sư nội thất;Đạo diễn phim | Studio nghệ thuật, sân khấu, văn phòng thiết kế, không gian sáng tạo, freelance |
| S | Social (Xã hội) | Người thuộc nhóm Social thích làm việc với con người để giúp đỡ, dạy dỗ, chăm sóc hoặc hướng dẫn họ. Họ có xu hướng quan tâm đến phúc lợi của người khác và thích giao tiếp. | Thân thiện, hợp tác, kiên nhẫn, đồng cảm, giao tiếp tốt, quan tâm người khác, nhân văn | Giáo viên;Y tá;Tư vấn viên;Nhà tâm lý học;Công tác xã hội;Nhân viên nhân sự;Huấn luyện viên;Chuyên gia trị liệu | Trường học, bệnh viện, tổ chức phi lợi nhuận, văn phòng tư vấn, cộng đồng |
| E | Enterprising (Kinh doanh) | Người thuộc nhóm Enterprising thích dẫn dắt, thuyết phục, quản lý và tổ chức để đạt được mục tiêu tổ chức hoặc lợi ích kinh tế. Họ có xu hướng năng động, tự tin và có tham vọng. | Tự tin, tham vọng, năng động, thuyết phục, dám chấp nhận rủi ro, lãnh đạo, ngoại hướng | Doanh nhân;Giám đốc điều hành;Nhà quản lý;Nhân viên bán hàng;Luật sư;Chính trị gia;Marketing Manager;Đại diện kinh doanh | Văn phòng công ty, môi trường kinh doanh, phòng họp, sự kiện networking, startup |
| C | Conventional (Truyền thống) | Người thuộc nhóm Conventional thích làm việc với dữ liệu, số liệu, theo quy trình và hệ thống có tổ chức rõ ràng. Họ đánh giá cao sự chính xác, trật tự và quy tắc. | Có tổ chức, cẩn thận, chính xác, đáng tin cậy, tuân thủ quy tắc, tỉ mỉ, có trách nhiệm | Kế toán;Thư ký;Nhân viên hành chính;Kiểm toán viên;Nhân viên ngân hàng;Quản lý hồ sơ;Data Entry;Chuyên viên thuế | Văn phòng có cấu trúc, ngân hàng, công ty kế toán, cơ quan chính phủ, môi trường ổn định |

---

## ✅ Checklist sau khi tạo file

- [ ] File được tạo tại đúng đường dẫn: `D:\server-ai\holyann\hoexapp\module\feature2\config\interests.csv`
- [ ] File có đúng 7 dòng (1 header + 6 data rows)
- [ ] File encoding UTF-8 (để hiển thị tiếng Việt đúng)
- [ ] Mỗi dòng có đúng 6 cột phân cách bởi dấu phẩy
- [ ] Không có dòng trống ở cuối file
- [ ] File có thể mở bằng Excel/Notepad và xem nội dung

---

## 🧪 Test sau khi tạo

### 1. Verify file tồn tại
```powershell
Test-Path "D:\server-ai\holyann\hoexapp\module\feature2\config\interests.csv"
# Kết quả phải là: True
```

### 2. Xem nội dung file
```powershell
Get-Content "D:\server-ai\holyann\hoexapp\module\feature2\config\interests.csv" | Select-Object -First 3
# Phải thấy header và 2 dòng đầu tiên
```

### 3. Restart Django server
```bash
# Stop server (Ctrl+C)
python manage.py runserver 127.0.0.1:8000
```

### 4. Test API
```powershell
curl -X POST http://127.0.0.1:8000/hoexapp/api/career-assessment/ -H "Content-Type: application/json" -d "{\"mbti_answers\":[1,2,3,4,5,6,7,8,9,10],\"grit_answers\":{\"q1\":5},\"riasec_answers\":{\"q1\":5}}"
```

Nếu không còn lỗi "No such file or directory" → ✅ Thành công!

---

## 📚 Tham khảo

### RIASEC Model (Holland Code)
- **R** - Realistic: Thực tế, kỹ thuật
- **I** - Investigative: Nghiên cứu, phân tích
- **A** - Artistic: Nghệ thuật, sáng tạo
- **S** - Social: Xã hội, giúp đỡ người khác
- **E** - Enterprising: Kinh doanh, lãnh đạo
- **C** - Conventional: Truyền thống, tổ chức

### Nguồn:
- Holland's Theory of Career Choice
- RIASEC Vocational Interest Model
- O*NET Interest Profiler

---

## 💡 Tips

1. **Backup file:** Sau khi tạo, backup file này để dễ restore sau này
2. **Customize:** Bạn có thể thêm nhiều thông tin hơn vào các cột tùy chọn
3. **Expand:** Nếu cần, có thể thêm các cột khác như `priority`, `color`, `icon`, etc.
4. **Version control:** Nếu dùng Git, commit file này vào repo

---

## 🆘 Troubleshooting

### Lỗi: "Permission denied"
```powershell
# Run PowerShell as Administrator
# Hoặc check quyền của thư mục
icacls "D:\server-ai\holyann\hoexapp\module\feature2\config"
```

### Lỗi: "Encoding issues" (tiếng Việt bị lỗi)
```powershell
# Đảm bảo save file với UTF-8 encoding
# Nếu dùng Notepad: Save As → Encoding → UTF-8
```

### Lỗi: "Invalid CSV format"
```powershell
# Kiểm tra có dấu phẩy thừa không
# Kiểm tra các field có quote đúng không (nếu chứa dấu phẩy trong text)
```

---

**Chúc bạn tạo file thành công! 🎉**
