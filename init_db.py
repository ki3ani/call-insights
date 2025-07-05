#!/usr/bin/env python3
"""
Database initialization script
Creates all tables and sets up the database schema
"""
import os
import sys
from dotenv import load_dotenv

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.database import engine
from app.models import Base

def init_database():
    """Initialize the database by creating all tables"""
    print("Initializing database...")
    print(f"Database URL: {os.getenv('DATABASE_URL')}")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"✅ Created tables: {tables}")
        
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = init_database()
    if success:
        print("\n🎉 Database initialization completed successfully!")
    else:
        print("\n❌ Database initialization failed!")
        sys.exit(1)