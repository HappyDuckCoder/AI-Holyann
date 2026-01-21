# Fix socket.ts
$socketPath = "D:\holyann-ai-web\src\lib\socket.ts"
$content = Get-Content $socketPath -Raw
$content = $content -replace "import \{ verifyToken \} from '@/lib/auth';", "import { JWTService } from './services/jwt.service.js';"
$content = $content -replace "const decoded = verifyToken\(token\);", "const decoded = JWTService.verifyToken(token);"
Set-Content -Path $socketPath -Value $content -NoNewline
Write-Host "Fixed socket.ts"

# Verify
Get-Content $socketPath | Select-Object -First 10
