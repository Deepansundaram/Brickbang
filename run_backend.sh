#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
echo "🚀 Starting Construction AI Backend..."
echo "API will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
python main.py
