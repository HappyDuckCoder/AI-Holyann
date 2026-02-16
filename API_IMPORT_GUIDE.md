# API Import Guide - Feature 1

Hướng dẫn import và sử dụng Feature 1 trong Django views và các module khác.

## Cấu trúc Module

Feature 1 được tổ chức thành các folder:
- `core/` - Core modules (business logic)
- `api/` - API integrations
- `config/` - Configuration files
- `tests/` - Test modules
- `utils/` - Utility tools
- `demo/` - Demo application
- `docs/` - Documentation

## Import trong Django Views

### Cách 1: Import từ module root (Khuyến nghị)

```python
from hoexapp.module.feature1 import process_profile, validate_input
```

Module root (`__init__.py`) tự động export tất cả functions và classes từ `core/`.

### Cách 2: Import trực tiếp từ core

```python
from hoexapp.module.feature1.core import process_profile, validate_input
```

### Sử dụng trong API endpoint

```python
from django.http import JsonResponse
from hoexapp.module.feature1 import process_profile, validate_input

@csrf_exempt
def profile_analysis_api(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    try:
        # Parse JSON
        data = json.loads(request.body)
        
        # Validate input
        is_valid, errors, warnings, normalized_data = validate_input(data)
        
        if not is_valid:
            return JsonResponse({
                "error": "Invalid input",
                "errors": errors
            }, status=400)
        
        # Process profile
        result = process_profile(normalized_data)
        
        # Return result
        return JsonResponse(result, json_dumps_params={'ensure_ascii': False})
        
    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=500)
```

## Available Exports

### Main Functions

- `process_profile(input_data: Dict) -> Dict` - Main processing function
- `validate_input(data: Dict) -> Tuple[bool, List[str], List[str], Dict]` - Input validation

### Classes

- `Feature1Processor` - Main processor class
- `InputProcessor` - Input processing
- `RegionalScorer` - Regional scoring
- `SpikeDetector` - Spike detection
- `OutputGenerator` - Output generation
- `InputValidator` - Input validation

### Enums and Types

- `Region` - Region enum (USA, ASIA, EUROPE_AUSTRALIA_CANADA)
- `SharpnessLevel` - Spike sharpness levels
- `PillarScores` - Pillar scores dataclass
- `RegionalScore` - Regional score dataclass
- `SpikeResult` - Spike result dataclass

## Example: Full Import

```python
from hoexapp.module.feature1 import (
    process_profile,
    validate_input,
    Feature1Processor,
    InputProcessor,
    RegionalScorer,
    SpikeDetector,
    OutputGenerator,
    Region,
    SharpnessLevel,
    PillarScores
)
```

## Error Handling

Nếu import thất bại, có thể do:
1. Module chưa được cài đặt đúng
2. Python path không đúng
3. Thiếu dependencies

Kiểm tra:
```python
try:
    from hoexapp.module.feature1 import process_profile
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback: try direct import from core
    try:
        from hoexapp.module.feature1.core import process_profile
    except ImportError:
        raise ImportError("Cannot import Feature 1 modules")
```

## Migration từ cấu trúc cũ

### Trước đây:
```python
from hoexapp.module.feature1.validator import validate_input
from hoexapp.module.feature1.main_processor import process_profile
```

### Bây giờ:
```python
from hoexapp.module.feature1 import validate_input, process_profile
```

Hoặc:
```python
from hoexapp.module.feature1.core import validate_input, process_profile
```

## Notes

- Tất cả imports sử dụng absolute imports từ `hoexapp.module.feature1`
- Module root (`__init__.py`) tự động export từ `core/`
- Không cần import trực tiếp từ `core/` trừ khi cần thiết
- API endpoints nên sử dụng `process_profile` và `validate_input` từ module root

