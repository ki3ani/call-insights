# AI Call Insights Platform - Backend

A FastAPI-based backend for an AI call insights platform with real-time communication, PostgreSQL database, and Docker support.

## Features

- **FastAPI Backend**: Modern, fast web framework for building APIs
- **Real-time Communication**: WebSocket support for live updates
- **PostgreSQL Database**: Robust relational database with SQLAlchemy ORM
- **Authentication**: JWT-based authentication system
- **Docker Support**: Containerized development environment
- **Health Checks**: Comprehensive health monitoring endpoints
- **CORS Configuration**: Frontend integration support

## Project Structure

```
milymale/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic schemas for request/response
│   ├── database.py          # Database configuration
│   ├── auth.py              # Authentication utilities
│   └── routers/
│       ├── __init__.py
│       ├── calls.py         # Call management endpoints
│       ├── users.py         # User management endpoints
│       ├── companies.py     # Company management endpoints
│       ├── websocket.py     # WebSocket endpoints
│       └── health.py        # Health check endpoints
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # This file
```

## Quick Start

### Using Docker (Recommended)

1. **Clone and navigate to the project directory:**
   ```bash
   cd milymale
   ```

2. **Start the services:**
   ```bash
   docker-compose up --build
   ```

3. **The API will be available at:**
   - API: http://localhost:8000
   - Interactive API docs: http://localhost:8000/docs
   - PostgreSQL: localhost:5432

### Manual Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb call_insights_db
   
   # Update .env file with your database credentials
   ```

3. **Run the application:**
   ```bash
   uvicorn app.main:app --reload
   ```

## API Endpoints

### Health Checks
- `GET /health/` - Basic health check
- `GET /health/detailed` - Detailed health information
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user info

### Companies
- `GET /api/companies/` - List companies
- `POST /api/companies/` - Create company
- `GET /api/companies/{id}` - Get company details
- `GET /api/companies/me/info` - Get current user's company

### Users
- `GET /api/users/` - List users (company scope)
- `GET /api/users/{id}` - Get user details

### Calls
- `GET /api/calls/` - List calls (with filters)
- `POST /api/calls/` - Create new call
- `GET /api/calls/{id}` - Get call details
- `PUT /api/calls/{id}` - Update call
- `DELETE /api/calls/{id}` - Delete call
- `GET /api/calls/user/{user_id}` - Get user's calls

### WebSocket
- `WS /ws/connect?token={jwt_token}` - Connect to WebSocket
- `POST /ws/broadcast` - Broadcast message to users

## Testing the API

### 1. Health Check
```bash
curl http://localhost:8000/health/
```

### 2. Create a Company
```bash
curl -X POST "http://localhost:8000/api/companies/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "domain": "testcompany.com",
    "industry": "Technology"
  }'
```

### 3. Register a User
```bash
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@testcompany.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepassword123",
    "company_id": 1
  }'
```

### 4. Login
```bash
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@testcompany.com",
    "password": "securepassword123"
  }'
```

### 5. Create a Call (requires authentication)
```bash
curl -X POST "http://localhost:8000/api/calls/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Sales Call with Client X",
    "description": "Discussion about Q4 requirements",
    "duration": 1800,
    "user_id": 1,
    "company_id": 1
  }'
```

### 6. WebSocket Connection Test
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/connect?token=YOUR_JWT_TOKEN');

ws.onmessage = function(event) {
  console.log('Received:', JSON.parse(event.data));
};

ws.onopen = function() {
  // Send a ping message
  ws.send(JSON.stringify({
    type: 'ping',
    data: {}
  }));
};
```

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/call_insights_db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

## Database Models

### Company
- `id`: Primary key
- `name`: Company name
- `domain`: Company domain (unique)
- `industry`: Industry type
- `created_at`, `updated_at`: Timestamps

### User
- `id`: Primary key
- `email`: User email (unique)
- `first_name`, `last_name`: User names
- `role`: User role (default: "user")
- `company_id`: Foreign key to Company
- `is_active`: Account status
- `created_at`, `updated_at`: Timestamps

### Call
- `id`: Primary key
- `title`: Call title
- `description`: Call description
- `duration`: Call duration in seconds
- `status`: Processing status (pending, processing, completed, failed)
- `audio_url`: URL to audio file
- `transcript`: Call transcript
- `summary`: AI-generated summary
- `insights`: JSON field for AI insights
- `sentiment_score`: Sentiment analysis score
- `confidence_score`: AI confidence score
- `user_id`, `company_id`: Foreign keys
- `created_at`, `updated_at`: Timestamps

## WebSocket Events

The WebSocket connection supports the following event types:

### Client to Server
- `ping`: Heartbeat message
- `call_status_update`: Update call status
- `join_call_room`: Join a call room
- `leave_call_room`: Leave a call room

### Server to Client
- `connection_established`: Connection confirmed
- `pong`: Heartbeat response
- `call_status_updated`: Call status changed
- `user_joined_call`: User joined call room
- `user_left_call`: User left call room

## Development

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
# Generate migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

### Code Formatting
```bash
# Format with black
black app/

# Sort imports
isort app/
```

## Production Deployment

1. **Update environment variables:**
   - Change `SECRET_KEY` to a secure random string
   - Update `DATABASE_URL` to production database
   - Configure `CORS_ORIGINS` for your frontend domain

2. **Use production WSGI server:**
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

3. **Set up reverse proxy with nginx**

4. **Configure SSL/TLS certificates**

## Security Considerations

- JWT tokens are used for authentication
- Passwords are hashed with bcrypt
- Database queries use SQLAlchemy ORM to prevent SQL injection
- CORS is configured for specific origins
- Environment variables are used for sensitive configuration

## License

This project is licensed under the MIT License.# live-call-insights
# live-call-insights
