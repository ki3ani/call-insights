#!/bin/bash

echo "🚀 Setting up Complete AI Call Insights Platform"
echo "==============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ All prerequisites are installed"

# Setup backend
echo ""
echo "🔧 Setting up backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "📥 Installing backend dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Initialize database
echo "🗄️ Initializing database..."
python init_db.py

echo "✅ Backend setup complete"

# Setup frontend
echo ""
echo "🔧 Setting up frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "🔐 Test credentials:"
echo "  Email: testuser@testcompany.com"
echo "  Password: securepassword123"
echo ""
echo "✨ Features to test:"
echo "  - Authentication (login/register)"
echo "  - Real-time dashboard"
echo "  - WebSocket test interface"
echo "  - Real-time messaging"
echo "  - Call management with live updates"