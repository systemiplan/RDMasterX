@echo off
echo Building RDMasterX for Windows...
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies!
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo Failed to build frontend!
    pause
    exit /b %errorlevel%
)

echo.
echo Step 3: Creating Windows installer...
call npm run build-win
if %errorlevel% neq 0 (
    echo Failed to create Windows installer!
    pause
    exit /b %errorlevel%
)

echo.
echo Build completed successfully!
echo The installer can be found in the 'release' folder.
echo.
pause
