@echo off
echo ================================================
echo   RDMasterX - Development Mode Setup
echo ================================================
echo.

echo Setting up development environment...
echo.

echo 1. Copying development environment file...
if exist .env (
    echo .env already exists, backing up to .env.backup
    copy .env .env.backup
)
copy .env.development .env
echo ✓ Development environment configured

echo.
echo 2. Installing dependencies...
call npm install
echo ✓ Dependencies installed

echo.
echo 3. Testing mock Active Directory...
call npm run test-ad
echo ✓ Mock AD test completed

echo.
echo ================================================
echo   Development Setup Complete!
echo ================================================
echo.
echo Available test users:
echo   - john.doe : password
echo   - jane.smith : password  
echo   - admin : admin123
echo   - test.user : test123
echo.
echo To start development:
echo   npm run dev
echo.
echo To test components:
echo   npm run test-ad
echo.
echo Mock domain: iplan.gov.il
echo Mode: Development (Mock AD)
echo.
pause
