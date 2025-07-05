#!/bin/bash

echo "🚀 Starting AI Call Insights Platform Backend"
echo "============================================"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Run ./setup_complete.sh first"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Start the backend
echo "🔄 Starting FastAPI backend on http://localhost:8000"
echo "📚 API documentation available at http://localhost:8000/docs"
echo "❤️ Health check at http://localhost:8000/health/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --reload