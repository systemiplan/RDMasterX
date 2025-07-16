@echo off
echo RDMasterX Setup Script
echo This script installs all necessary dependencies for Active Directory integration
echo.

echo Installing Node.js dependencies...
call npm install

echo Installing Active Directory packages...
call npm install activedirectory ldapjs

echo Installing additional security and utility packages...
call npm install dotenv bcrypt jsonwebtoken express-rate-limit helmet cors

echo Installing development dependencies...
call npm install --save-dev nodemon

echo Creating logs directory...
if not exist logs mkdir logs

echo Setting up environment configuration...
if not exist .env (
    copy .env.example .env
    echo Environment file created. Please edit .env with your Active Directory settings.
)

echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your Active Directory configuration
echo 2. Configure your domain controller settings
echo 3. Test the connection with: npm run test-ad
echo 4. Start the application with: npm start
echo.
echo For development mode: npm run dev

pause
