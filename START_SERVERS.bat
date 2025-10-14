@echo off
echo ========================================
echo Starting Backend and Frontend Servers
echo ========================================
echo.

echo Starting Backend Server on port 5000...
start "Backend Server" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul

echo Starting Frontend Server on port 5173...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Servers Started Successfully!
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:5173

echo.
echo Servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
