@echo off
echo ==========================================
echo 🧠 Starting MeshMemory Node...
echo ==========================================

:: 1. Start Weaviate (Docker)
echo [1/3] Starting Vector Database (Docker)...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Error: Docker is not running or docker-compose failed.
    pause
    exit /b
)

:: 2. Start Backend (in a new window)
echo [2/3] Starting Backend Brain...
start "MeshMemory Backend" cmd /k "cd mesh-core\backend && pip install -r requirements.txt && uvicorn main:app --reload"

:: 3. Start Frontend (in a new window)
echo [3/3] Starting Control Center UI...
start "MeshMemory UI" cmd /k "cd ui && npm install && npm run dev"

echo.
echo ✅ System Launching!
echo ------------------------------------------
echo 🌍 UI:      http://localhost:3000
echo 🔌 Backend: http://localhost:8000
echo ------------------------------------------
echo Press any key to close this launcher (services will keep running)...
pause >nul
