# AI Call Insights Platform - Frontend

A React/TypeScript frontend for the AI call insights platform with real-time WebSocket communication.

## Features

- **React 18 + TypeScript**: Modern frontend framework with type safety
- **Real-time WebSocket Connection**: Live communication with FastAPI backend
- **Tailwind CSS**: Beautiful, responsive UI components
- **React Router**: Client-side routing for SPA experience
- **Authentication**: JWT-based authentication with protected routes
- **Call Dashboard**: Interactive dashboard for call management
- **WebSocket Test Interface**: Tools to test real-time communication
- **Real-time Messaging**: Chat and call room functionality

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- FastAPI backend running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

### Backend Connection

Make sure the FastAPI backend is running:

```bash
# In the backend directory
source venv/bin/activate
uvicorn app.main:app --reload
```

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout.tsx     # Main application layout
│   │   └── ProtectedRoute.tsx # Authentication guard
│   ├── contexts/          # React contexts for state management
│   │   ├── AuthContext.tsx    # Authentication context
│   │   └── WebSocketContext.tsx # WebSocket connection context
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── Login.tsx      # Login page
│   │   ├── Register.tsx   # Registration page
│   │   ├── CallsPage.tsx  # Call management
│   │   ├── WebSocketTest.tsx # WebSocket testing interface
│   │   └── RealTimeMessaging.tsx # Real-time messaging test
│   ├── services/          # API and WebSocket services
│   │   ├── api.ts         # REST API service
│   │   └── websocket.ts   # WebSocket service
│   ├── types/             # TypeScript type definitions
│   │   ├── api.ts         # API response types
│   │   └── index.ts       # Main type exports
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles and Tailwind imports
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Authentication

### Test Credentials

Use these credentials to test the application:

- **Email**: testuser@testcompany.com
- **Password**: securepassword123

### Authentication Flow

1. **Login/Register**: Navigate to `/login` or `/register`
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Auto-connect WebSocket**: WebSocket connects automatically when authenticated
4. **Protected Routes**: All main routes require authentication

## Features Overview

### Dashboard

- Real-time call metrics and statistics
- Recent calls display with live status updates
- WebSocket connection status indicator
- Real-time activity feed

### Call Management

- Create, view, and manage calls
- Real-time status updates via WebSocket
- Search and filter functionality
- Call details with transcripts and insights

### WebSocket Testing

- Connection status monitoring
- Send predefined or custom messages
- Message log with real-time updates
- Auto-ping functionality for connection testing

### Real-time Messaging

- Join/leave call rooms
- Send messages in real-time
- Simulate call controls (mic, camera, volume)
- Call status updates

## WebSocket Communication

The frontend establishes a WebSocket connection to receive real-time updates:

### Connection URL
```
ws://localhost:8000/ws/connect?token={jwt_token}
```

### Supported Message Types

#### Outgoing (Client → Server)
- `ping`: Heartbeat message
- `call_status_update`: Update call status
- `join_call_room`: Join a call room
- `leave_call_room`: Leave a call room
- `custom_message`: Custom message with data

#### Incoming (Server → Client)
- `pong`: Heartbeat response
- `connection_established`: Connection confirmation
- `call_status_updated`: Call status changed
- `user_joined_call`: User joined call room
- `user_left_call`: User left call room

### Example Message Format
```json
{
  "type": "call_status_update",
  "data": {
    "call_id": 1,
    "status": "processing"
  }
}
```

## API Integration

The frontend communicates with the FastAPI backend via REST API:

### Base URL
```
http://localhost:8000
```

### Authentication
All authenticated requests include the JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

### Main Endpoints
- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration
- `GET /api/users/me` - Get current user
- `GET /api/calls/` - List calls
- `POST /api/calls/` - Create call
- `PUT /api/calls/{id}` - Update call
- `GET /health/` - Health check

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Variables

Create a `.env` file for custom configuration:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

### Proxy Configuration

The Vite dev server is configured to proxy API requests to the backend:

- `/api/*` → `http://localhost:8000/api/*`
- `/ws/*` → `ws://localhost:8000/ws/*`

## Testing the Application

### 1. Start the Backend
```bash
cd ../  # Go to backend directory
source venv/bin/activate
uvicorn app.main:app --reload
```

### 2. Start the Frontend
```bash
npm run dev
```

### 3. Test Authentication
1. Navigate to http://localhost:3000
2. Click "Sign in to your existing account"
3. Use test credentials: testuser@testcompany.com / securepassword123

### 4. Test WebSocket Connection
1. Go to "WebSocket Test" in the sidebar
2. Verify connection status shows "connected"
3. Send a ping message and observe the response

### 5. Test Real-time Messaging
1. Go to "Messaging Test" in the sidebar
2. Join a call room (e.g., Room 1)
3. Send messages and observe real-time updates
4. Test call controls and status updates

### 6. Test Call Management
1. Go to "Calls" in the sidebar
2. Create a new call
3. Observe real-time status updates on the dashboard

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy Static Files
The build output in `dist/` can be served by any static file server:

- Nginx
- Apache
- Netlify
- Vercel
- AWS S3 + CloudFront

### Configuration for Production
1. Update API base URL in environment variables
2. Configure CORS in the backend for your domain
3. Use HTTPS for WebSocket connections (wss://)
4. Set up proper authentication token refresh

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **WebSocket API** - Real-time communication

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Maintain component reusability
4. Add proper error handling
5. Include loading states for async operations

## License

This project is licensed under the MIT License.