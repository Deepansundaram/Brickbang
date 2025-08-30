@echo off
echo 🏗️ Construction AI Management App Setup
echo ======================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 3 is required but not installed.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Python backend
echo 📦 Setting up Python backend...
python -m venv venv
call venv\Scripts\activate.bat

REM Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo ✅ Python backend setup complete

REM Setup React frontend
echo ⚛️ Setting up React frontend...
cd frontend
npm install
cd ..

echo ✅ Frontend setup complete

REM Setup database
echo 🗄️ Setting up database...
python seed_data.py

echo ✅ Database setup complete

echo.
echo 🎉 Setup Complete!
echo ====================
echo.
echo To start the application:
echo 1. Backend: Run 'python main.py' or 'run_backend.bat'
echo 2. Frontend: Run 'cd frontend && npm start' or 'run_frontend.bat'
echo.
echo Login credentials:
echo - Username: admin, Password: admin123
echo - Username: manager, Password: manager123
echo.
echo Access the app at: http://localhost:3000
echo API documentation: http://localhost:8000/docs
echo.
pause
