import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { WebSocketMessage } from '@/types';
import { 
  Wifi, 
  WifiOff, 
  Send, 
  Trash2, 
  Play, 
  Square,
  RefreshCw,
  Activity,
  MessageSquare,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const WebSocketTest: React.FC = () => {
  const { user } = useAuth();
  const { 
    isConnected, 
    connectionState, 
    messages, 
    sendMessage, 
    connect, 
    disconnect, 
    clearMessages 
  } = useWebSocket();
  
  const [messageType, setMessageType] = useState<string>('ping');
  const [messageData, setMessageData] = useState<string>('{}');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh && isConnected) {
      interval = setInterval(() => {
        sendPingMessage();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isConnected]);

  const sendTestMessage = () => {
    try {
      const data = JSON.parse(messageData);
      const message: WebSocketMessage = {
        type: messageType,
        data: data,
        user_id: user?.id,
      };
      sendMessage(message);
    } catch (error) {
      console.error('Invalid JSON in message data:', error);
    }
  };

  const sendPingMessage = () => {
    sendMessage({
      type: 'ping',
      data: {}
    });
  };

  const sendCallStatusUpdate = () => {
    sendMessage({
      type: 'call_status_update',
      data: {
        call_id: 1,
        status: 'processing'
      }
    });
  };

  const sendJoinCallRoom = () => {
    sendMessage({
      type: 'join_call_room',
      data: {
        call_id: 1
      }
    });
  };

  const sendCustomMessage = () => {
    try {
      const message: WebSocketMessage = JSON.parse(customMessage);
      sendMessage(message);
      setCustomMessage('');
    } catch (error) {
      console.error('Invalid JSON in custom message:', error);
    }
  };

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

  const getConnectionStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <WifiOff className="h-5 w-5 text-gray-400" />;
    }
  };

  const predefinedMessages = [
    {
      name: 'Ping',
      type: 'ping',
      data: {},
      description: 'Send a ping message to test connection'
    },
    {
      name: 'Call Status Update',
      type: 'call_status_update',
      data: { call_id: 1, status: 'processing' },
      description: 'Update the status of a call'
    },
    {
      name: 'Join Call Room',
      type: 'join_call_room',
      data: { call_id: 1 },
      description: 'Join a call room for real-time updates'
    },
    {
      name: 'Leave Call Room',
      type: 'leave_call_room',
      data: { call_id: 1 },
      description: 'Leave a call room'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">WebSocket Test Interface</h1>
          <p className="text-secondary-600 mt-1">
            Test real-time WebSocket communication with the backend
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getConnectionStatusIcon()}
            <div>
              <h3 className="font-semibold text-secondary-900">Connection Status</h3>
              <p className={`text-sm capitalize ${getConnectionStatusColor()}`}>
                {connectionState}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-secondary-300"
              />
              <span className="text-sm text-secondary-700">Auto-ping (5s)</span>
            </label>
            
            {isConnected ? (
              <button
                onClick={disconnect}
                className="btn-outline flex items-center space-x-2"
              >
                <Square className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={connect}
                className="btn-primary flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Sending */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Quick Actions</span>
            </h3>
            
            <div className="space-y-3">
              {predefinedMessages.map((msg, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-md">
                  <div>
                    <p className="font-medium text-secondary-900">{msg.name}</p>
                    <p className="text-sm text-secondary-600">{msg.description}</p>
                  </div>
                  <button
                    onClick={() => sendMessage({ type: msg.type, data: msg.data })}
                    disabled={!isConnected}
                    className="btn-primary disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div className="card">
            <h3 className="font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Custom Message</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Message Type</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., ping, call_status_update"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                />
              </div>
              
              <div>
                <label className="label">Message Data (JSON)</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder='{"key": "value"}'
                  value={messageData}
                  onChange={(e) => setMessageData(e.target.value)}
                />
              </div>
              
              <button
                onClick={sendTestMessage}
                disabled={!isConnected}
                className="btn-primary disabled:opacity-50 w-full flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send Custom Message</span>
              </button>
            </div>
          </div>

          {/* Raw JSON Message */}
          <div className="card">
            <h3 className="font-semibold text-secondary-900 mb-4">Raw JSON Message</h3>
            
            <div className="space-y-4">
              <textarea
                className="input"
                rows={6}
                placeholder='{"type": "ping", "data": {}}'
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
              
              <button
                onClick={sendCustomMessage}
                disabled={!isConnected || !customMessage.trim()}
                className="btn-primary disabled:opacity-50 w-full flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send Raw Message</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900 flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Message Log ({messages.length})</span>
            </h3>
            
            <button
              onClick={clearMessages}
              className="btn-outline flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {messages.length > 0 ? (
              messages.slice().reverse().map((message, index) => (
                <div key={index} className="p-3 bg-secondary-50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-secondary-900">
                      {message.type}
                    </span>
                    <span className="text-xs text-secondary-500">
                      {message.timestamp 
                        ? new Date(message.timestamp).toLocaleTimeString() 
                        : 'Just now'
                      }
                    </span>
                  </div>
                  <pre className="text-xs text-secondary-700 bg-white p-2 rounded overflow-x-auto">
                    {JSON.stringify(message.data, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-secondary-300" />
                <p>No messages received yet</p>
                <p className="text-sm">Send a message to see it appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketTest;