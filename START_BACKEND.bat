@echo off
title Backend Server - Port 5000
color 0A
echo ========================================
echo   BACKEND SERVER
echo   Port: 5000
echo   Database: MongoDB (user-management)
echo ========================================
echo.
echo Starting server...
echo.
cd backend
node server.js
pause
