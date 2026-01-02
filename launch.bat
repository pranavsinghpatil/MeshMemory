@echo off
title MeshMemory Launcher
color 0A

echo ===================================================
echo       MeshMemory 2.0 - Second Brain Launcher
echo ===================================================
echo.

echo [1/3] Checking for Weaviate...
set "WEAVIATE_MODE=local"
if exist .env (
    for /f "tokens=1* delims==" %%A in (.env) do (
        if /i "%%A"=="WEAVIATE_MODE" set "WEAVIATE_MODE=%%B"
    )
)

if /i "%WEAVIATE_MODE%"=="cloud" (
    echo [Cloud Mode] Skipping local Docker startup. Connects to Weaviate Cloud.
) else (
    echo [Local Mode] Starting Database...
    docker-compose up -d
    timeout /t 10 /nobreak >nul
)
echo.

echo [2/3] Starting Backend (Port 8000)...
start "MeshMemory Backend" cmd /k "cd mesh-core\backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [3/3] Starting Frontend (Port 3000)...
start "MeshMemory Frontend" cmd /k "cd ui && npm run dev"

echo.
echo ===================================================
echo       MeshMemory is launching! 🚀
echo ===================================================
echo.
echo Backend: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this launcher (windows will stay open)...
pause >nul
