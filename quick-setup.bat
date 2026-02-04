@echo off
echo ========================================
echo  CHECKLIST MODULE - QUICK SETUP
echo ========================================
echo.

echo [1/4] Killing existing Node processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul
echo      Done!

echo.
echo [2/4] Clearing Next.js cache...
if exist .next rmdir /s /q .next >nul 2>&1
echo      Done!

echo.
echo [3/4] Starting development server...
start /B npm run dev
timeout /t 15 /nobreak >nul
echo      Server starting...

echo.
echo [4/4] Seeding database...
timeout /t 5 /nobreak >nul
curl -s http://localhost:3000/api/seed-checklist
echo.

echo.
echo ========================================
echo  SETUP COMPLETE!
echo ========================================
echo.
echo Open your browser and go to:
echo   http://localhost:3000/student/checklist
echo.
echo Press any key to exit...
pause >nul
