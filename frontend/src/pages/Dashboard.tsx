import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Call, CallMetrics } from '@/types';
import { apiService } from '@/services/api';
import { 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isConnected, lastMessage } = useWebSocket();
  const [calls, setCalls] = useState<Call[]>([]);
  const [metrics, setMetrics] = useState<CallMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [callsData] = await Promise.all([
          apiService.getCalls({ limit: 10 })
        ]);
        
        setCalls(callsData);
        
        // Calculate metrics
        const calculatedMetrics: CallMetrics = {
          total_calls: callsData.length,
          pending_calls: callsData.filter(c => c.status === 'pending').length,
          processing_calls: callsData.filter(c => c.status === 'processing').length,
          completed_calls: callsData.filter(c => c.status === 'completed').length,
          failed_calls: callsData.filter(c => c.status === 'failed').length,
          average_duration: callsData.reduce((acc, c) => acc + (c.duration || 0), 0) / (callsData.length || 1),
          average_sentiment: callsData.reduce((acc, c) => acc + (c.sentiment_score || 0), 0) / (callsData.length || 1),
        };
        
        setMetrics(calculatedMetrics);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update calls when WebSocket messages are received
  useEffect(() => {
    if (lastMessage?.type === 'call_status_updated') {
      const { call_id, status } = lastMessage.data;
      setCalls(prev => prev.map(call => 
        call.id === call_id ? { ...call, status } : call
      ));
    }
  }, [lastMessage]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Play className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "badge";
    switch (status) {
      case 'completed':
        return `${baseClasses} badge-success`;
      case 'processing':
        return `${baseClasses} badge-info`;
      case 'failed':
        return `${baseClasses} badge-error`;
      default:
        return `${baseClasses} badge-warning`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 bg-primary-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-secondary-600 mt-1">
            Here's an overview of your call insights platform
          </p>
        </div>
        
        {/* Connection Status Indicator */}
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Calls</p>
                <p className="text-2xl font-bold text-secondary-900">{metrics.total_calls}</p>
              </div>
              <Phone className="h-8 w-8 text-primary-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completed_calls}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.processing_calls}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Avg Duration</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {Math.round(metrics.average_duration / 60)}m
                </p>
              </div>
              <Clock className="h-8 w-8 text-secondary-500" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Calls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">Recent Calls</h2>
          <BarChart3 className="h-5 w-5 text-secondary-400" />
        </div>
        
        {calls.length > 0 ? (
          <div className="space-y-3">
            {calls.slice(0, 5).map((call) => (
              <div key={call.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(call.status)}
                  <div>
                    <p className="font-medium text-secondary-900">{call.title}</p>
                    <p className="text-sm text-secondary-600">
                      {call.description || 'No description'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={getStatusBadge(call.status)}>
                    {call.status}
                  </span>
                  <span className="text-sm text-secondary-500">
                    {new Date(call.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-500">
            <Phone className="h-12 w-12 mx-auto mb-3 text-secondary-300" />
            <p>No calls found. Create your first call to get started!</p>
          </div>
        )}
      </div>

      {/* Real-time Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">Real-time Activity</h2>
          <TrendingUp className="h-5 w-5 text-secondary-400" />
        </div>
        
        {lastMessage ? (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Latest WebSocket Message</p>
                <p className="text-sm text-blue-700">Type: {lastMessage.type}</p>
              </div>
              <span className="text-xs text-blue-600">
                {lastMessage.timestamp ? new Date(lastMessage.timestamp).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
            <pre className="mt-2 text-xs text-blue-800 bg-blue-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(lastMessage.data, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-center py-4 text-secondary-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-secondary-300" />
            <p>No real-time activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;