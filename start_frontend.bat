@echo off
echo ========================================================
echo  Starting Sovereign AI Workbench Frontend (Port 5173)...
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause