# Postman Test Guide for Profile Analysis API (Feature 1)

## Endpoint Details

**Base URL (chạy Django tại thư mục holyann):**
- `http://localhost:8000/hoexapp/api/profile-analysis/`
- Hoặc `http://127.0.0.1:8000/hoexapp/api/profile-analysis/`

**Method:** `POST`

**Headers:**

```
Content-Type: application/json
```

**Ví dụ gọi nhanh (curl):**

```bash
curl -X POST http://localhost:8000/hoexapp/api/profile-analysis/ \
  -H "Content-Type: application/json" \
  -d '{"academic":{"gpa":8.5,"subject_scores":[],"academic_awards":[]},"language_and_standardized":{"languages":[{"language_name":"IELTS","score":"7.0"}],"standardized_tests":[]},"action":{"actions":[]},"non_academic_awards":[],"personal_projects":[],"skill":{"skills":[]}}'
```

## Request Body Structure

```json
{
  "academic": {
    "gpa": 8.5,
    "subject_scores": [
      {"subject": "Toán", "score": 9.0},
      {"subject": "Vật Lý", "score": 8.5}
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
        "scale": 100,
        "region": "school"
      }
    ]
  },
  "non_academic_awards": [
    {
      "award_name": "Giải Nhì Piano Quốc Gia",
      "category": "art",
      "year": 2024,
      "rank": 2,
      "region": "national"
    }
  ],
  "personal_projects": [
    {
      "project_name": "Ứng dụng Quản lý Thư viện",
      "topic": "Science/Tech",
      "description": "Xây dựng app mobile",
      "duration_months": 6
    }
  ],
  "skill": {
    "skills": [
      {"skill_name": "Python Programming", "proficiency": "ADVANCED"}
    ]
  }
}
```

## Test JSON Payloads

### Example 1: Full Profile (High Achiever)

File: `POSTMAN_INPUT_TEST.json`

Xem file `POSTMAN_INPUT_TEST.json` trong folder `docs/` để xem ví dụ đầy đủ.

### Example 2: Minimal Profile

File: `POSTMAN_INPUT_TEST_MINIMAL.json`

Xem file `POSTMAN_INPUT_TEST_MINIMAL.json` trong folder `docs/` để xem ví dụ tối thiểu.

### Example 3: Expected Output

File: `POSTMAN_OUTPUT_TEST.json`

Xem file `POSTMAN_OUTPUT_TEST.json` trong folder `docs/` để xem ví dụ output mẫu.

## Valid Values

### Region (Khu Vực)
- `international` - Quốc Tế
- `national` - Quốc Gia
- `province` - Tỉnh/Thành
- `city` - Thành Phố
- `school` - Trường
- `local` - Địa Phương

### Role (Vai Trò)
- `LEADER` - Lãnh Đạo
- `CORE` - Thành Viên Cốt Cán
- `MEMBER` - Thành Viên
- `HELP` - Hỗ Trợ

### Proficiency (Cấp Độ Kỹ Năng)
- `BEGINNER` - Sơ Cấp
- `INTERMEDIATE` - Trung Cấp
- `ADVANCED` - Cao Cấp
- `EXPERT` - Chuyên Gia

### Award Category (Loại Giải Thưởng)
- `science` - Khoa học/Logic (Math, Physics, Tech...)
- `social` - Xã hội (Sử, Địa...)
- `language` - Ngôn ngữ (Anh, Văn...)

## Expected Response

### Success Response (200 OK)

Response bao gồm 4 phần chính:

#### A. Đánh giá điểm số (Weighted Score Evaluation)

Điểm số và xếp loại theo 3 vùng:
- **Mỹ**: Score = 0.25(Aca) + 0.25(Lan) + 0.25(HDNK) + 0.25(Skill)
- **Châu Á**: Score = 0.35(Aca) + 0.30(Lan) + 0.175(HDNK) + 0.175(Skill)
- **Âu/Úc/Canada**: Score = 0.40(Aca) + 0.30(Lan) + 0.15(HDNK) + 0.15(Skill)

Xếp loại: `High` (≥75), `Med` (50-74), `Low` (<50)

```json
{
  "A. Đánh giá điểm số (Weighted Score Evaluation)": {
    "Khu vực": [
      {
        "Vùng": "Mỹ",
        "Điểm số (Score)": 75.25,
        "Xếp loại (Rating)": "High",
        "Chi tiết": {
          "Học thuật (Aca)": 18.75,
          "Ngôn ngữ (Lan)": 20.50,
          "Hoạt động ngoại khóa (HDNK)": 18.00,
          "Kỹ năng (Skill)": 18.00
        }
      },
      {
        "Vùng": "Châu Á",
        "Điểm số (Score)": 78.50,
        "Xếp loại (Rating)": "High",
        "Chi tiết": {
          "Học thuật (Aca)": 26.25,
          "Ngôn ngữ (Lan)": 24.60,
          "Hoạt động ngoại khóa (HDNK)": 12.60,
          "Kỹ năng (Skill)": 15.05
        }
      },
      {
        "Vùng": "Âu/Úc/Canada",
        "Điểm số (Score)": 80.20,
        "Xếp loại (Rating)": "High",
        "Chi tiết": {
          "Học thuật (Aca)": 30.00,
          "Ngôn ngữ (Lan)": 24.60,
          "Hoạt động ngoại khóa (HDNK)": 10.80,
          "Kỹ năng (Skill)": 14.80
        }
      }
    ]
  }
}
```

#### B. Phân tích SWOT

```json
{
  "B. Phân tích SWOT": {
    "Strengths (Điểm mạnh)": [
      "Bạn có spike mạnh trong lĩnh vực 'Academic Excellence' với độ sắc High",
      "Điểm mạnh nổi bật ở trụ cột Học thuật (điểm: 75.0)"
    ],
    "Weaknesses (Điểm yếu)": [
      "Trụ cột Kỹ năng còn yếu (điểm: 25.0), cần cải thiện"
    ],
    "Opportunities (Cơ hội)": [
      "Cơ hội tốt nhất ở khu vực Âu/Úc/Canada với điểm số 80.20"
    ],
    "Threats (Thách thức)": [
      "Thách thức ở khu vực Mỹ với điểm số 75.25, cần cải thiện"
    ]
  }
}
```

#### C. Nhận diện Spike (Yếu tố cốt lõi)

```json
{
  "C. Nhận diện Spike (Yếu tố cốt lõi)": {
    "Loại Spike hiện tại": "Academic Excellence",
    "Bằng chứng định hình": [
      "Olympic Toán Học Quốc Gia (national, rank 1)",
      "SAT score: 1450"
    ],
    "Độ sắc (Sharpness)": "High",
    "Nhận xét": "Spike 'Academic Excellence' của bạn có độ sắc cao, thể hiện mức độ cạnh tranh tốt so với pool hồ sơ tương đương."
  }
}
```

#### D. Điểm số gốc (Pillar Scores)

```json
{
  "D. Điểm số gốc (Pillar Scores)": {
    "Học thuật (Aca)": 75.0,
    "Ngôn ngữ (Lan)": 82.0,
    "Hoạt động ngoại khóa (HDNK)": 72.0,
    "Kỹ năng (Skill)": 59.0
  }
}
```

#### Summary

```json
{
  "summary": {
    "success": true,
    "total_pillar_scores": {
      "aca": 75.0,
      "lan": 82.0,
      "hdnk": 72.0,
      "skill": 59.0
    },
    "main_spike": "Academic Excellence",
    "sharpness": "High"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "error": "Thiếu phần bắt buộc: academic",
  "success": false
}
```

## Postman Setup Steps

1. **Create New Request**
   - Method: `POST`
   - URL: `http://localhost:8000/hoexapp/api/profile-analysis/`

2. **Set Headers**
   - Key: `Content-Type`
   - Value: `application/json`

3. **Set Body**
   - Select `raw`
   - Select `JSON` from dropdown
   - Paste JSON from `POSTMAN_INPUT_TEST.json` or `POSTMAN_INPUT_TEST_MINIMAL.json` (trong folder `docs/`)

4. **Send Request**
   - Click `Send` button
   - View response in the response panel

## cURL Command

```bash
curl -X POST http://localhost:8000/hoexapp/api/profile-analysis/ \
  -H "Content-Type: application/json" \
  -d @docs/POSTMAN_INPUT_TEST.json
```

## Python Example

```python
import requests
import json
import os

url = "http://localhost:8000/hoexapp/api/profile-analysis/"

# Load from file (adjust path based on your working directory)
# If running from feature1 root:
input_file = os.path.join('docs', 'POSTMAN_INPUT_TEST.json')
# Or if running from project root:
# input_file = 'hoexapp/module/feature1/docs/POSTMAN_INPUT_TEST.json'

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

response = requests.post(url, json=data)
result = response.json()

print(json.dumps(result, indent=2, ensure_ascii=False))
```

## Notes

### File Locations
- All POSTMAN test files are located in `docs/` folder:
  - `POSTMAN_INPUT_TEST.json` - Full example input
  - `POSTMAN_INPUT_TEST_MINIMAL.json` - Minimal example input
  - `POSTMAN_OUTPUT_TEST.json` - Example output
- API implementation is in `core/` folder
- See `README_STRUCTURE.md` for detailed folder structure

### Input Requirements
- All arrays can be empty `[]` if no data
- GPA is required and must be between 0-10
- Region and role values are case-sensitive
- Score values can be numbers or strings depending on type (e.g., IELTS 7.5, JLPT N2)
- API returns results in Vietnamese
- **Academic awards** should include `category` field: "science", "social", or "language"
- **Non-academic awards** (optional): Include `category` field: "art", "music", "sport", "athletic"
  - Nghệ thuật: 50% HDNK + 50% Skill
- **Personal projects** (optional): Include `topic` field to determine weight distribution
  - Science/Tech: 60% Aca + 40% HDNK
  - Research: 85% Aca + 15% HDNK
  - Culture/Business: 50% HDNK + 37.5% Skill + 12.5% Aca
  - Sport/Art: 50% HDNK + 50% Skill
- **Social Projects** (in `action.actions`): 100% HDNK
- The system automatically distributes scores to 4 pillars (Aca, Lan, HDNK, Skill) based on weights
- Spike detection analyzes all data to identify the main competitive advantage
- SWOT analysis is automatically generated based on scores and spike

## Response Structure Overview

1. **Score Evaluation**: Regional scores with weighted calculations for 3 regions
2. **SWOT Analysis**: Strengths, Weaknesses, Opportunities, Threats
3. **Spike Identification**: Main spike type, evidence, sharpness level, and competitive assessment
4. **Pillar Scores**: Raw scores for 4 pillars before regional weighting
5. **Summary**: Quick overview with main spike and sharpness
