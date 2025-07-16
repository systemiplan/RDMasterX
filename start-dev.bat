@echo off
echo Starting RDMasterX Development Environment...
echo.

echo Installing dependencies (if needed)...
call npm install

echo.
echo Starting backend and frontend servers...
echo Backend will run on http://localhost:3001
echo Frontend will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop the servers
echo.

call npm run start
