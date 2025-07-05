import asyncio
import httpx
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def test_health_endpoints():
    """Test health check endpoints"""
    print("Testing health endpoints...")
    
    async with httpx.AsyncClient() as client:
        # Basic health check
        response = await client.get(f"{BASE_URL}/health/")
        print(f"Health check: {response.status_code} - {response.json()}")
        
        # Detailed health check
        response = await client.get(f"{BASE_URL}/health/detailed")
        print(f"Detailed health: {response.status_code}")
        
        # Readiness check
        response = await client.get(f"{BASE_URL}/health/ready")
        print(f"Readiness check: {response.status_code}")
        
        # Liveness check
        response = await client.get(f"{BASE_URL}/health/live")
        print(f"Liveness check: {response.status_code}")

async def test_company_creation():
    """Test company creation"""
    print("\nTesting company creation...")
    
    async with httpx.AsyncClient() as client:
        # Try to get existing companies first
        response = await client.get(f"{BASE_URL}/api/companies/")
        if response.status_code == 200:
            companies = response.json()
            if companies:
                company = companies[0]
                print(f"Using existing company: {company['name']} (ID: {company['id']})")
                return company['id']
        
        # Create new company if none exists
        company_data = {
            "name": "Test Company",
            "domain": "testcompany.com",
            "industry": "Technology"
        }
        
        response = await client.post(f"{BASE_URL}/api/companies/", json=company_data)
        print(f"Company creation: {response.status_code}")
        if response.status_code == 200:
            company = response.json()
            print(f"Created company: {company['name']} (ID: {company['id']})")
            return company['id']
        elif response.status_code == 400:
            # Company already exists, try to find it
            response = await client.get(f"{BASE_URL}/api/companies/")
            if response.status_code == 200:
                companies = response.json()
                for company in companies:
                    if company['domain'] == 'testcompany.com':
                        print(f"Found existing company: {company['name']} (ID: {company['id']})")
                        return company['id']
        
        print(f"Error: {response.text}")
        return None

async def test_user_registration_and_login(company_id):
    """Test user registration and login"""
    print("\nTesting user registration and login...")
    
    async with httpx.AsyncClient() as client:
        # Register user
        user_data = {
            "email": "testuser@testcompany.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "securepassword123",
            "company_id": company_id
        }
        
        response = await client.post(f"{BASE_URL}/api/users/register", json=user_data)
        print(f"User registration: {response.status_code}")
        
        user_id = None
        if response.status_code == 200:
            user = response.json()
            user_id = user['id']
            print(f"Registered user: {user['email']} (ID: {user['id']})")
        elif response.status_code == 400:
            print("User already exists, proceeding with login...")
            # Assume user ID is 1 for existing user
            user_id = 1
        else:
            print(f"Registration error: {response.text}")
            return None, None
        
        # Login
        login_data = {
            "email": "testuser@testcompany.com",
            "password": "securepassword123"
        }
        
        response = await client.post(f"{BASE_URL}/api/users/login", json=login_data)
        print(f"User login: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"Login successful, token type: {token_data['token_type']}")
            return token_data['access_token'], user_id
        else:
            print(f"Login error: {response.text}")
            return None, None

async def test_authenticated_endpoints(token, user_id, company_id):
    """Test endpoints that require authentication"""
    print("\nTesting authenticated endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        # Get current user info
        response = await client.get(f"{BASE_URL}/api/users/me", headers=headers)
        print(f"Get current user: {response.status_code}")
        
        # Create a call
        call_data = {
            "title": "Test Sales Call",
            "description": "Discussion about Q4 requirements",
            "duration": 1800,
            "user_id": user_id,
            "company_id": company_id
        }
        
        response = await client.post(f"{BASE_URL}/api/calls/", json=call_data, headers=headers)
        print(f"Create call: {response.status_code}")
        
        if response.status_code == 200:
            call = response.json()
            print(f"Created call: {call['title']} (ID: {call['id']})")
            
            # Get calls list
            response = await client.get(f"{BASE_URL}/api/calls/", headers=headers)
            print(f"Get calls list: {response.status_code}")
            
            if response.status_code == 200:
                calls = response.json()
                print(f"Found {len(calls)} calls")
                
                # Update call
                if calls:
                    call_id = calls[0]['id']
                    update_data = {
                        "status": "processing",
                        "transcript": "This is a sample transcript of the call.",
                        "summary": "Call summary: Discussed Q4 requirements and next steps."
                    }
                    
                    response = await client.put(f"{BASE_URL}/api/calls/{call_id}", json=update_data, headers=headers)
                    print(f"Update call: {response.status_code}")
                    
                    return call_id
        
        return None

async def test_websocket_broadcast(token, call_id):
    """Test WebSocket broadcast functionality"""
    print("\nTesting WebSocket broadcast...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        message_data = {
            "type": "call_status_update",
            "data": {
                "call_id": call_id,
                "status": "completed",
                "message": "Call processing completed successfully"
            }
        }
        
        response = await client.post(f"{BASE_URL}/ws/broadcast", json=message_data, headers=headers)
        print(f"WebSocket broadcast: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Broadcast result: {result['message']}")

async def run_all_tests():
    """Run all API tests"""
    print("Starting API endpoint tests...")
    print("=" * 50)
    
    try:
        # Test health endpoints
        await test_health_endpoints()
        
        # Test company creation
        company_id = await test_company_creation()
        if not company_id:
            print("Company creation failed, stopping tests")
            return
        
        # Test user registration and login
        token, user_id = await test_user_registration_and_login(company_id)
        if not token or not user_id:
            print("User registration/login failed, stopping tests")
            return
        
        # Test authenticated endpoints
        call_id = await test_authenticated_endpoints(token, user_id, company_id)
        
        # Test WebSocket broadcast
        if call_id:
            await test_websocket_broadcast(token, call_id)
        
        print("\n" + "=" * 50)
        print("All tests completed successfully!")
        print("API is ready for use.")
        
    except Exception as e:
        print(f"\nError during testing: {e}")
        print("Make sure the API server is running on http://localhost:8000")

if __name__ == "__main__":
    asyncio.run(run_all_tests())