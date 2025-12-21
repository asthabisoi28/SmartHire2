@echo off
title AI Interview System Server
color 0A
echo ===============================================
echo    AI INTERVIEW SYSTEM - SERVER STARTUP
echo ===============================================
echo.
echo [INFO] Starting server on http://localhost:3000
echo [INFO] Main Application: http://localhost:3000/index_new.html
echo.
echo [FEATURES] All Latest Updates Included:
echo  ✓ Question-specific coding validation
echo  ✓ Interview Room always accessible (no score threshold)
echo  ✓ Pause/resume timers (15min + 45min)
echo  ✓ Expected vs Actual output display
echo  ✓ Professional ATS checker
echo.
echo [STATUS] Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000/index_new.html
echo.
echo [RUNNING] Server is active! Press Ctrl+C to stop.
echo ===============================================
echo.
node simple-server.js
echo.
echo [STOPPED] Server has been stopped.
pause