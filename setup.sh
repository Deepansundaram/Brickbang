#!/bin/bash

echo "🏗️ Construction AI Management App Setup"
echo "======================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Python backend
echo "📦 Setting up Python backend..."
cd "$(dirname "$0")"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # For Linux/Mac
# For Windows: venv\Scripts\activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Python backend setup complete"

# Setup React frontend
echo "⚛️ Setting up React frontend..."
cd frontend
npm install

echo "✅ Frontend setup complete"

# Setup database
echo "🗄️ Setting up database..."
cd ..
python seed_data.py

echo "✅ Database setup complete"

echo ""
echo "🎉 Setup Complete!"
echo "===================="
echo ""
echo "To start the application:"
echo "1. Backend: Run 'python main.py' or './run_backend.sh'"
echo "2. Frontend: Run 'cd frontend && npm start' or './run_frontend.sh'"
echo ""
echo "Login credentials:"
echo "- Username: admin, Password: admin123"
echo "- Username: manager, Password: manager123"
echo ""
echo "Access the app at: http://localhost:3000"
echo "API documentation: http://localhost:8000/docs"
