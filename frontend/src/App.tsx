import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { apiService } from '@/services/api';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Components
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CallsPage from '@/pages/CallsPage';
import WebSocketTest from '@/pages/WebSocketTest';
import RealTimeMessaging from '@/pages/RealTimeMessaging';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiService.getToken();
      if (token) {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to get current user:', error);
          apiService.clearToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 bg-primary-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <WebSocketProvider>
        <div className="min-h-screen bg-secondary-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="calls" element={<CallsPage />} />
              <Route path="websocket-test" element={<WebSocketTest />} />
              <Route path="messaging-test" element={<RealTimeMessaging />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;