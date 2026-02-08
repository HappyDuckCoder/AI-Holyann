# Script kiểm tra tất cả config files Django còn thiếu gì

Write-Host "`n🔍 CHECKING DJANGO CONFIG FILES..." -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

$configDir = "D:\server-ai\holyann\hoexapp\module\feature2\config"

# Files có thể cần thiết
$requiredFiles = @(
    @{Name="interests.csv"; Type="CSV"; Critical=$true; Description="RIASEC interests data"},
    @{Name="Personality_Model.h5"; Type="Model"; Critical=$true; Description="MBTI ML model"},
    @{Name="careers.csv"; Type="CSV"; Critical=$true; Description="Career database"},
    @{Name="universities.csv"; Type="CSV"; Critical=$false; Description="University database"},
    @{Name="riasec_mapping.csv"; Type="CSV"; Critical=$false; Description="RIASEC to career mapping"},
    @{Name="mbti_traits.csv"; Type="CSV"; Critical=$false; Description="MBTI traits description"},
    @{Name="grit_scale.csv"; Type="CSV"; Critical=$false; Description="Grit scale data"}
)

Write-Host "`n📍 Config directory: $configDir" -ForegroundColor Yellow

if (-not (Test-Path $configDir)) {
    Write-Host "`n❌ Config directory does NOT exist!" -ForegroundColor Red
    Write-Host "Creating directory..." -ForegroundColor Yellow
    New-Item -Path $configDir -ItemType Directory -Force | Out-Null
    Write-Host "✅ Directory created" -ForegroundColor Green
} else {
    Write-Host "✅ Config directory exists" -ForegroundColor Green
}

Write-Host "`n📋 File Status:" -ForegroundColor Cyan
Write-Host "-" * 70 -ForegroundColor Gray

$missingCritical = @()
$missingOptional = @()
$found = @()

foreach ($file in $requiredFiles) {
    $path = Join-Path $configDir $file.Name
    $exists = Test-Path $path

    $status = if ($exists) { "✅" } else { "❌" }
    $priority = if ($file.Critical) { "[CRITICAL]" } else { "[OPTIONAL]" }
    $color = if ($exists) { "Green" } else { if ($file.Critical) { "Red" } else { "Yellow" } }

    Write-Host "$status $($file.Name.PadRight(25)) " -NoNewline -ForegroundColor $color
    Write-Host "$priority " -NoNewline -ForegroundColor $(if ($file.Critical) { "Red" } else { "Gray" })
    Write-Host "- $($file.Description)" -ForegroundColor Gray

    if (-not $exists) {
        if ($file.Critical) {
            $missingCritical += $file
        } else {
            $missingOptional += $file
        }
    } else {
        $found += $file
        # Show file info
        $fileInfo = Get-Item $path
        Write-Host "  └─ Size: $($fileInfo.Length) bytes | Modified: $($fileInfo.LastWriteTime)" -ForegroundColor DarkGray
    }
}

# Summary
Write-Host "`n" + "=" * 70 -ForegroundColor Gray
Write-Host "📊 SUMMARY:" -ForegroundColor Cyan
Write-Host "  ✅ Found: $($found.Count)" -ForegroundColor Green
Write-Host "  ❌ Missing Critical: $($missingCritical.Count)" -ForegroundColor Red
Write-Host "  ⚠️  Missing Optional: $($missingOptional.Count)" -ForegroundColor Yellow

# Missing critical files
if ($missingCritical.Count -gt 0) {
    Write-Host "`n🚨 CRITICAL FILES MISSING:" -ForegroundColor Red
    foreach ($file in $missingCritical) {
        Write-Host "  ❌ $($file.Name) - $($file.Description)" -ForegroundColor Red
    }
}

# Missing optional files
if ($missingOptional.Count -gt 0) {
    Write-Host "`n⚠️  OPTIONAL FILES MISSING:" -ForegroundColor Yellow
    foreach ($file in $missingOptional) {
        Write-Host "  ⚠️  $($file.Name) - $($file.Description)" -ForegroundColor Yellow
    }
}

# Search for model files in entire server-ai directory
Write-Host "`n🔎 Searching for missing model files in D:\server-ai\..." -ForegroundColor Cyan
Write-Host "(This may take a minute...)" -ForegroundColor Gray

$searchPaths = @("D:\server-ai\")
$foundModels = @{}

foreach ($file in $missingCritical + $missingOptional) {
    if ($file.Type -eq "Model") {
        Write-Host "`nSearching for: $($file.Name)" -ForegroundColor Yellow
        foreach ($searchPath in $searchPaths) {
            try {
                $results = Get-ChildItem -Path $searchPath -Recurse -Filter $file.Name -ErrorAction SilentlyContinue
                if ($results) {
                    $foundModels[$file.Name] = $results
                    Write-Host "  ✅ FOUND at:" -ForegroundColor Green
                    foreach ($result in $results) {
                        Write-Host "     $($result.FullName)" -ForegroundColor Green
                        Write-Host "     Size: $($result.Length) bytes | Modified: $($result.LastWriteTime)" -ForegroundColor DarkGray
                    }
                }
            } catch {
                # Ignore access denied errors
            }
        }

        if (-not $foundModels.ContainsKey($file.Name)) {
            Write-Host "  ❌ Not found in D:\server-ai\" -ForegroundColor Red
        }
    }
}

# Recommendations
Write-Host "`n" + "=" * 70 -ForegroundColor Gray
Write-Host "💡 RECOMMENDATIONS:" -ForegroundColor Cyan

if ($missingCritical.Count -eq 0) {
    Write-Host "  🎉 All critical files are present!" -ForegroundColor Green
    Write-Host "  → You can proceed with testing" -ForegroundColor White
} else {
    Write-Host "`nFor CSV files:" -ForegroundColor Yellow
    foreach ($file in $missingCritical | Where-Object { $_.Type -eq "CSV" }) {
        Write-Host "  1. Check if script exists: create-$($file.Name.Replace('.csv',''))-csv.ps1" -ForegroundColor White
        Write-Host "  2. Or create manually following the template" -ForegroundColor White
    }

    Write-Host "`nFor Model files:" -ForegroundColor Yellow
    foreach ($file in $missingCritical | Where-Object { $_.Type -eq "Model" }) {
        if ($foundModels.ContainsKey($file.Name)) {
            Write-Host "  ✅ Found $($file.Name) - Copy to config:" -ForegroundColor Green
            foreach ($result in $foundModels[$file.Name]) {
                Write-Host "     copy `"$($result.FullName)`" `"$configDir\`"" -ForegroundColor Gray
            }
        } else {
            Write-Host "  ❌ $($file.Name) not found. Options:" -ForegroundColor Red
            Write-Host "     - Restore from backup" -ForegroundColor White
            Write-Host "     - Request from team/admin" -ForegroundColor White
            Write-Host "     - Use mock/fallback implementation" -ForegroundColor White
        }
    }
}

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - For interests.csv: See CREATE_INTERESTS_CSV_PROMPT.md" -ForegroundColor Gray
Write-Host "  - For model files: See DJANGO_MISSING_MODEL_ERROR.md" -ForegroundColor Gray

Write-Host "`n" + "=" * 70 -ForegroundColor Gray
Write-Host ""
