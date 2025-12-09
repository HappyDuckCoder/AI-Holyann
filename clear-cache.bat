@echo off
echo Cleaning TypeScript and Next.js cache...
echo.

REM Remove .next directory
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
    echo .next removed
) else (
    echo .next directory not found
)

REM Remove node_modules/.cache
if exist node_modules\.cache (
    echo Removing node_modules/.cache...
    rmdir /s /q node_modules\.cache
    echo node_modules/.cache removed
) else (
    echo node_modules/.cache not found
)

REM Remove tsconfig.tsbuildinfo
if exist tsconfig.tsbuildinfo (
    echo Removing tsconfig.tsbuildinfo...
    del tsconfig.tsbuildinfo
    echo tsconfig.tsbuildinfo removed
) else (
    echo tsconfig.tsbuildinfo not found
)

echo.
echo Cache cleaned successfully!
echo.
echo Now run: npm run dev
echo.
pause

