@echo off
setlocal
cd /d "%~dp0"
echo Starting HisabPro on http://127.0.0.1:8080 ...
echo Press Ctrl+C in this window to stop the server.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8080'"
python -m http.server 8080 --bind 127.0.0.1
if errorlevel 1 (
  echo.
  echo Python was not found. Install Python 3, or serve this folder with any static web server.
  pause
)
endlocal
