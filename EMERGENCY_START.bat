@echo off
title EMERGENCY SERVER START - AI Interview System
color 0C
echo ================================================
echo     EMERGENCY SERVER STARTUP - AI INTERVIEW
echo ================================================
echo.
echo [EMERGENCY] Killing any existing node processes...
taskkill /f /im node.exe >nul 2>&1
echo [EMERGENCY] Starting fresh server instance...
echo.
echo [URL] http://localhost:3000/index_new.html
echo [URL] http://localhost:3000/simple.html (backup)
echo.
echo [STATUS] Server starting in 2 seconds...
timeout /t 2 /nobreak >nul
echo.
echo [OPENING] Browser launching...
start http://localhost:3000/index_new.html
echo.
echo [RUNNING] Server is now active!
echo ================================================
echo.
node simple-server.js
echo.
echo [STOPPED] Server stopped.
pause