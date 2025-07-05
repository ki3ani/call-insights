import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { 
  LayoutDashboard, 
  Phone, 
  TestTube, 
  MessageSquare, 
  LogOut, 
  User,
  Wifi,
  WifiOff
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isConnected, connectionState } = useWebSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calls', label: 'Calls', icon: Phone },
    { path: '/websocket-test', label: 'WebSocket Test', icon: TestTube },
    { path: '/messaging-test', label: 'Messaging Test', icon: MessageSquare },
  ];

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-secondary-900">
                AI Call Insights Platform
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* WebSocket Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className={`h-5 w-5 ${getConnectionStatusColor()}`} />
                ) : (
                  <WifiOff className={`h-5 w-5 ${getConnectionStatusColor()}`} />
                )}
                <span className={`text-sm ${getConnectionStatusColor()}`}>
                  {connectionState}
                </span>
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-secondary-500" />
                <span className="text-sm text-secondary-700">
                  {user?.first_name} {user?.last_name}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn-outline flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-secondary-200">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                            : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;