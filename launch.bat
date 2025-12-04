@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo 🧠 Starting MeshMemory Node...
echo ==========================================

:: 0. Environment Setup
echo [0/4] Checking Environment...

if exist ".venv" goto :venv_exists

echo    - Creating virtual environment (.venv)...
python -m venv .venv
if %errorlevel% neq 0 goto :error_venv

:venv_exists
echo    - Virtual environment found.
echo    - Activating venv...
call .venv\Scripts\activate.bat
if %errorlevel% neq 0 goto :error_activate

echo    - Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 goto :error_install

:: 1. Start Weaviate (Docker)
echo [1/4] Starting Vector Database (Docker)...
docker-compose up -d
if %errorlevel% neq 0 goto :error_docker

:: 2. Start Backend (in a new window)
echo [2/4] Starting Backend Brain...
start "MeshMemory Backend" cmd /k "call .venv\Scripts\activate.bat && cd mesh-core\backend && uvicorn main:app --reload"

:: 3. Start Frontend (in a new window)
echo [3/4] Starting Control Center UI...
start "MeshMemory UI" cmd /k "cd ui && npm install && npm run dev"

echo.
echo ✅ System Launching!
echo ------------------------------------------
echo 🌍 UI:      http://localhost:3000
echo 🔌 Backend: http://localhost:8000
echo ------------------------------------------
echo Press any key to close this launcher (services will keep running)...
pause >nul
goto :eof

:error_venv
echo ❌ Error: Failed to create venv. Is Python installed?
pause
exit /b 1

:error_activate
echo ❌ Error: Failed to activate venv.
pause
exit /b 1

:error_install
echo ❌ Error: Failed to install dependencies.
pause
exit /b 1

:error_docker
echo ❌ Error: Docker is not running or docker-compose failed.
pause
exit /b 1
