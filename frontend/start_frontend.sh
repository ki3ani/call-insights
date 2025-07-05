#!/bin/bash

echo "🚀 Starting AI Call Insights Platform Frontend"
echo "============================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Run npm install first"
    exit 1
fi

# Start the frontend
echo "🔄 Starting React development server on http://localhost:3000"
echo "🔗 Make sure backend is running on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev