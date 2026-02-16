# Feature 1 - Hệ thống đánh giá hồ sơ học sinh

## Tổng quan

Hệ thống đánh giá hồ sơ học sinh với các tính năng:
1. Phân bổ dữ liệu đầu vào vào 4 trụ cột (Academic, Language, HDNK, Skill) theo trọng số
2. Tính điểm theo 3 vùng (Mỹ, Châu Á, Âu/Úc/Canada) với công thức trọng số khác nhau
3. Nhận diện Spike và tính Sharpness
4. Tạo output template với Score Evaluation, SWOT Analysis, và Spike Identification

## Cấu trúc Module

### 1. `input_processor.py`
Xử lý dữ liệu đầu vào và phân bổ vào 4 trụ cột:
- **Academic (Aca)**: GPA, điểm môn học, giải thưởng học thuật
- **Language (Lan)**: Chứng chỉ ngôn ngữ, bài thi chuẩn hóa
- **HDNK**: Dự án xã hội, giải thưởng ngoài học thuật, dự án cá nhân
- **Skill**: Kỹ năng cứng và kỹ năng mềm

**Phân bổ trọng số:**
- Môn Tự nhiên: 100% Aca
- Môn Ngôn ngữ: 60% Aca + 40% Lan
- Môn Xã hội: 60% Aca + 40% Skill
- Language Cert: 100% Lan
- SAT/ACT: 65% Aca + 35% Lan
- A-Level/AP/IB: 80% Aca + 20% Lan
- Social Projects: 100% HDNK
- Personal Projects: Phân bổ theo topic
- Hard Skills: Phân bổ theo category
- Soft Skills: 100% Skill

### 2. `regional_scorer.py`
Tính điểm theo 3 vùng với trọng số khác nhau:

**Vùng A - Mỹ (Toàn diện):**
- Score = 0.25(Aca) + 0.25(Lan) + 0.25(HDNK) + 0.25(Skill)

**Vùng B - Châu Á & Nội địa:**
- Score = 0.35(Aca) + 0.30(Lan) + 0.175(HDNK) + 0.175(Skill)

**Vùng C - Canada, Úc, Anh, Châu Âu:**
- Score = 0.40(Aca) + 0.30(Lan) + 0.15(HDNK) + 0.15(Skill)

**Xếp loại:**
- High: ≥ 75.0
- Med: 50.0 - 74.9
- Low: < 50.0

### 3. `spike_detector.py`
Thuật toán nhận diện Spike:

**Quy trình:**
1. Input Scan: Quét toàn bộ dữ liệu đã phân loại
2. Condition Check: Đối chiếu với bộ từ khóa và tiêu chí nhóm
3. Magnitude Check: So sánh cường độ thành tích
4. Output Generation: Xác định Main Spike và Sharpness

**12 loại Spike:**
1. Academic Excellence
2. Research
3. Olympiad / Competition
4. Leadership
5. Social Impact / Community Service
6. Entrepreneurship
7. Artistic
8. Athletic
9. Media / Content Creation
10. Tech
11. Financial Hardship
12. Personal Story

**Sharpness Levels:**
- Exceptional: ≥ 20.0
- High: 12.0 - 19.9
- Med: 6.0 - 11.9
- Low: < 6.0

### 4. `output_generator.py`
Tạo output template với:
- **Score Evaluation**: Điểm số và xếp loại theo từng vùng
- **SWOT Analysis**: Phân tích điểm mạnh, yếu, cơ hội, thách thức
- **Spike Identification**: Thông tin về spike chính và sharpness

### 5. `main_processor.py`
Module chính tích hợp tất cả các module:
- Xử lý flow từ input đến output
- Tích hợp tất cả các bước xử lý
- Format output thành dictionary

## Cách sử dụng

### Cơ bản

```python
from hoexapp.module.feature1 import process_profile

input_data = {
    "academic": {
        "gpa": 8.5,
        "subject_scores": [
            {"subject": "Toán", "score": 9.0},
            {"subject": "Vật Lý", "score": 8.5}
        ],
        "academic_awards": [
            {
                "award_name": "Olympic Toán Học Quốc Gia",
                "year": 2024,
                "rank": 1,
                "region": "national",
                "category": "science"
            }
        ]
    },
    "language_and_standardized": {
        "languages": [
            {"language_name": "IELTS", "score": "7.5"}
        ],
        "standardized_tests": [
            {"test_name": "SAT", "score": "1450"}
        ]
    },
    "action": {
        "actions": [
            {
                "action_name": "Chủ Tịch Hội Sinh Viên",
                "role": "LEADER",
                "scale": 200,
                "region": "school"
            }
        ]
    },
    "skill": {
        "skills": [
            {"skill_name": "Python Programming", "proficiency": "ADVANCED"}
        ]
    }
}

result = process_profile(input_data)
print(result)
```

### Sử dụng từng module riêng lẻ

```python
from hoexapp.module.feature1 import (
    InputProcessor, RegionalScorer, SpikeDetector, OutputGenerator
)

# 1. Xử lý input
processor = InputProcessor()
pillar_scores = processor.process_all(input_data)

# 2. Tính điểm theo vùng
scorer = RegionalScorer()
regional_scores = scorer.calculate_all_regions(pillar_scores)

# 3. Nhận diện spike
detector = SpikeDetector()
spike_result = detector.detect_spike(processor)

# 4. Tạo output
generator = OutputGenerator()
output = generator.generate_output(regional_scores, spike_result, pillar_scores)
formatted = generator.format_output(output)
```

## Format Input

### Academic
```json
{
  "academic": {
    "gpa": 8.5,
    "subject_scores": [
      {"subject": "Toán", "score": 9.0, "semester": 1}
    ],
    "academic_awards": [
      {
        "award_name": "Olympic Toán Học",
        "year": 2024,
        "rank": 1,
        "region": "national",
        "category": "science"
      }
    ]
  }
}
```

### Language & Standardized Tests
```json
{
  "language_and_standardized": {
    "languages": [
      {"language_name": "IELTS", "score": "7.5"}
    ],
    "standardized_tests": [
      {"test_name": "SAT", "score": "1450"},
      {"test_name": "AP", "score": "5", "subject": "Calculus"}
    ]
  }
}
```

### Actions (HDNK)
```json
{
  "action": {
    "actions": [
      {
        "action_name": "Chủ Tịch Hội Sinh Viên",
        "role": "LEADER",
        "scale": 200,
        "region": "school",
        "duration_months": 12
      }
    ]
  }
}
```

### Skills
```json
{
  "skill": {
    "skills": [
      {"skill_name": "Python Programming", "proficiency": "ADVANCED"},
      {"skill_name": "Leadership", "proficiency": "EXPERT"}
    ]
  }
}
```

## Format Output

Output bao gồm:
1. **Đánh giá điểm số**: Điểm và xếp loại theo từng vùng
2. **Phân tích SWOT**: Strengths, Weaknesses, Opportunities, Threats
3. **Nhận diện Spike**: Loại spike, bằng chứng, sharpness, nhận xét
4. **Điểm số gốc**: Điểm của 4 trụ cột trước khi nhân trọng số

## Các giá trị hợp lệ

### Region
- `international` - Quốc Tế
- `national` - Quốc Gia
- `province` - Tỉnh/Thành
- `city` - Thành Phố
- `school` - Trường
- `local` - Địa Phương

### Role
- `LEADER` - Lãnh Đạo
- `CORE` - Thành Viên Cốt Cán
- `MEMBER` - Thành Viên
- `HELP` - Hỗ Trợ

### Proficiency
- `BEGINNER` - Sơ Cấp
- `INTERMEDIATE` - Trung Cấp
- `ADVANCED` - Cao Cấp
- `EXPERT` - Chuyên Gia

## Files

- `input_processor.py`: Xử lý input và phân bổ trọng số
- `regional_scorer.py`: Tính điểm theo vùng
- `spike_detector.py`: Nhận diện spike
- `output_generator.py`: Tạo output template
- `main_processor.py`: Module chính tích hợp
- `spike.json`: Cấu hình spike detection
- `__init__.py`: Module exports
- `demo_app.py`: Ví dụ sử dụng

## Lưu ý

1. Tất cả điểm số được tính trên thang 0-100
2. Trọng số được áp dụng theo yêu cầu cụ thể
3. Spike detection dựa trên keywords và magnitude
4. SWOT analysis được tạo tự động dựa trên điểm số và spike

