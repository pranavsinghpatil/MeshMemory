@echo off
echo ==========================================
echo 🐞 MeshMemory Debug Launcher
echo ==========================================

echo [1/3] Checking Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is NOT running. Please start Docker Desktop.
    pause
    exit /b
)
echo ✅ Docker is running.

echo [2/3] Starting Weaviate...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start Weaviate.
    pause
    exit /b
)
echo ✅ Weaviate started.

echo [3/3] Starting Backend (in this window to see errors)...
cd mesh-core\backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install requirements.
    pause
    exit /b
)

echo 🚀 Starting Uvicorn...
uvicorn main:app --reload
pause
