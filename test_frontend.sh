#!/bin/bash

echo "🚀 Testing AI Call Insights Platform Frontend"
echo "============================================"

# Check if backend is running
echo "🔍 Checking if backend is running..."
if ! curl -s http://localhost:8000/health/ > /dev/null; then
    echo "❌ Backend is not running. Please start the backend first:"
    echo "   cd milymale"
    echo "   source venv/bin/activate"
    echo "   uvicorn app.main:app --reload"
    exit 1
fi

echo "✅ Backend is running"

# Check Node.js
echo "🔍 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check npm
echo "🔍 Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm version: $NPM_VERSION"

# Navigate to frontend directory
cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

echo "✅ Frontend project structure verified"

echo ""
echo "🎉 Frontend is ready for development!"
echo ""
echo "📝 Next steps:"
echo "1. Install dependencies:    cd frontend && npm install"
echo "2. Start development server: npm run dev"
echo "3. Open browser to:         http://localhost:3000"
echo ""
echo "🔐 Test credentials:"
echo "   Email:    testuser@testcompany.com"
echo "   Password: securepassword123"
echo ""
echo "🧪 Test features:"
echo "   - Login/Register"
echo "   - Dashboard with real-time updates"
echo "   - WebSocket Test interface"
echo "   - Real-time messaging"
echo "   - Call management"