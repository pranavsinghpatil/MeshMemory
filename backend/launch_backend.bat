@echo off
:: Launch knitter.app backend with fixed environment
echo =======================================
echo   LAUNCHING KNITTER.APP BACKEND
echo =======================================

set VENV_PYTHON=%CD%\venv\Scripts\python.exe
set PYTHONNOUSERSITE=1
REM Ensure project root and venv site-packages are the only places Python searches
set PYTHONPATH=%CD%;%CD%\venv\Lib\site-packages

:: Check if virtual environment exists
if not exist "%VENV_PYTHON%" (
    echo ERROR: Virtual environment not found at %VENV_PYTHON%
    echo Run fresh_install.bat first, then run fix_compatibility.py
    pause
    exit /b 1
)

:: Check if .env file exists
if not exist .env (
    echo Warning: .env file not found. Creating basic development .env...
    echo SUPABASE_URL=https://example.supabase.co > .env
    echo SUPABASE_SERVICE_KEY=your_service_key_here >> .env
    echo ENV=dev >> .env
    echo.
    echo Please update the .env file with your actual Supabase credentials
    echo.
)

echo Starting knitter.app backend server...
echo.
echo Server will be available at http://localhost:8000
echo Press CTRL+C to stop the server
echo.

:: Start the server directly with the local venv python
"%VENV_PYTHON%" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

echo.
if %errorlevel% neq 0 (
    echo ERROR: Server failed to start with error code %errorlevel%
    echo Try running fix_compatibility.py to fix dependency issues
) else (
    echo Server shutdown successfully
)

pause
