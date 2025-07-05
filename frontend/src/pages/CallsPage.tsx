import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Call, CallCreate, CallStatus } from '@/types';
import { apiService } from '@/services/api';
import { 
  Phone, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Edit3,
  Trash2
} from 'lucide-react';

const CallsPage: React.FC = () => {
  const { user } = useAuth();
  const { lastMessage } = useWebSocket();
  const [calls, setCalls] = useState<Call[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCall, setNewCall] = useState<Partial<CallCreate>>({
    title: '',
    description: '',
    duration: 0,
  });

  useEffect(() => {
    fetchCalls();
  }, []);

  useEffect(() => {
    filterCalls();
  }, [calls, searchTerm, statusFilter]);

  // Update calls when WebSocket messages are received
  useEffect(() => {
    if (lastMessage?.type === 'call_status_updated') {
      const { call_id, status } = lastMessage.data;
      setCalls(prev => prev.map(call => 
        call.id === call_id ? { ...call, status } : call
      ));
    }
  }, [lastMessage]);

  const fetchCalls = async () => {
    try {
      const callsData = await apiService.getCalls();
      setCalls(callsData);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCalls = () => {
    let filtered = calls;

    if (searchTerm) {
      filtered = filtered.filter(call =>
        call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (call.description && call.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(call => call.status === statusFilter);
    }

    setFilteredCalls(filtered);
  };

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newCall.title) return;

    try {
      const callData: CallCreate = {
        title: newCall.title,
        description: newCall.description || '',
        duration: newCall.duration || 0,
        user_id: user.id,
        company_id: user.company_id,
      };

      const createdCall = await apiService.createCall(callData);
      setCalls(prev => [createdCall, ...prev]);
      setShowCreateModal(false);
      setNewCall({ title: '', description: '', duration: 0 });
    } catch (error) {
      console.error('Failed to create call:', error);
    }
  };

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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          <h1 className="text-2xl font-bold text-secondary-900">Calls</h1>
          <p className="text-secondary-600 mt-1">
            Manage and monitor your call recordings
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Call</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search calls..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-secondary-400" />
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CallStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calls List */}
      <div className="card">
        {filteredCalls.length > 0 ? (
          <div className="space-y-4">
            {filteredCalls.map((call) => (
              <div key={call.id} className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(call.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900">{call.title}</h3>
                      <p className="text-sm text-secondary-600 mt-1">
                        {call.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500">
                        <span>Duration: {formatDuration(call.duration || 0)}</span>
                        <span>Created: {new Date(call.created_at).toLocaleDateString()}</span>
                        {call.sentiment_score && (
                          <span>Sentiment: {(call.sentiment_score * 100).toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadge(call.status)}>
                      {call.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-secondary-400 hover:text-primary-600">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-secondary-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {call.transcript && (
                  <div className="mt-3 p-3 bg-secondary-100 rounded-md">
                    <p className="text-sm text-secondary-700">
                      <strong>Transcript:</strong> {call.transcript.substring(0, 200)}
                      {call.transcript.length > 200 && '...'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Phone className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No calls found</h3>
            <p className="text-secondary-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first call'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create your first call
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Call Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Create New Call</h2>
            
            <form onSubmit={handleCreateCall} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Enter call title"
                  value={newCall.title || ''}
                  onChange={(e) => setNewCall(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Enter call description"
                  value={newCall.description || ''}
                  onChange={(e) => setNewCall(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="label">Duration (seconds)</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="Enter duration in seconds"
                  value={newCall.duration || ''}
                  onChange={(e) => setNewCall(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallsPage;