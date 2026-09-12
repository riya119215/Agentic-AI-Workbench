@echo off
title Sovereign AI Workbench Launcher
echo ========================================================
echo  Launching Sovereign On-Premise Agentic AI Workbench...
echo ========================================================

echo [1/2] Starting Backend API Server (Port 8000)...
start "Sovereign Backend API [Port 8000]" cmd /k "%~dp0start_backend.bat"

echo [2/2] Starting Frontend Web Dashboard (Port 5173)...
start "Sovereign Frontend UI [Port 5173]" cmd /k "%~dp0start_frontend.bat"

echo.
echo Waiting 4 seconds for services to initialize...
timeout /t 4 /nobreak >nul

echo Opening Sovereign Dashboard in browser: http://localhost:5173
start http://localhost:5173