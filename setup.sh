#!/bin/bash

echo "🚀 Setting up AI Call Insights Platform Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! python -c "import psycopg2; psycopg2.connect('postgresql://postgres:password@localhost:5432/postgres')" 2>/dev/null; then
    echo "❌ PostgreSQL is not running or not accessible"
    echo "Please start PostgreSQL and create the database:"
    echo "  sudo systemctl start postgresql"
    echo "  sudo -u postgres createdb call_insights_db"
    exit 1
fi

# Initialize database
echo "🗄️ Initializing database..."
python init_db.py

# Test the API
echo "🧪 Testing API endpoints..."
python test_endpoints.py

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🌟 To start the API server:"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "🌐 API will be available at: http://localhost:8000"
echo "📚 Interactive docs at: http://localhost:8000/docs"