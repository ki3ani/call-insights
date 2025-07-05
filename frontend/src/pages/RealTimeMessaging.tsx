import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { WebSocketMessage } from '@/types';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Phone,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'system' | 'call_update';
  content: string;
  timestamp: Date;
  user?: string;
  data?: any;
}

const RealTimeMessaging: React.FC = () => {
  const { user } = useAuth();
  const { isConnected, sendMessage, messages } = useWebSocket();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const [isInCall, setIsInCall] = useState<boolean>(false);
  const [callSettings, setCallSettings] = useState({
    microphone: true,
    camera: false,
    volume: true
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    // Process WebSocket messages for chat display
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        type: getMessageType(lastMessage),
        content: formatMessageContent(lastMessage),
        timestamp: new Date(lastMessage.timestamp || Date.now()),
        data: lastMessage.data
      };

      setChatMessages(prev => [...prev, chatMessage]);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageType = (message: WebSocketMessage): 'user' | 'system' | 'call_update' => {
    if (message.type.includes('call')) return 'call_update';
    if (message.type === 'connection_established' || message.type === 'pong') return 'system';
    return 'user';
  };

  const formatMessageContent = (message: WebSocketMessage): string => {
    switch (message.type) {
      case 'connection_established':
        return 'Connected to real-time messaging system';
      case 'pong':
        return 'Connection heartbeat received';
      case 'call_status_updated':
        return `Call ${message.data.call_id} status updated to: ${message.data.status}`;
      case 'user_joined_call':
        return `${message.data.user_name} joined the call`;
      case 'user_left_call':
        return `${message.data.user_name} left the call`;
      case 'custom_message':
        return message.data.content || 'Custom message received';
      default:
        return `${message.type}: ${JSON.stringify(message.data)}`;
    }
  };

  const sendChatMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    const message: WebSocketMessage = {
      type: 'custom_message',
      data: {
        content: inputMessage,
        user_name: `${user?.first_name} ${user?.last_name}`,
        room_id: currentRoom
      }
    };

    sendMessage(message);
    setInputMessage('');
  };

  const joinCallRoom = (callId: number) => {
    setCurrentRoom(callId);
    setIsInCall(true);
    
    const message: WebSocketMessage = {
      type: 'join_call_room',
      data: {
        call_id: callId
      }
    };

    sendMessage(message);
    
    const joinMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `Joined call room ${callId}`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, joinMessage]);
  };

  const leaveCallRoom = () => {
    if (currentRoom) {
      const message: WebSocketMessage = {
        type: 'leave_call_room',
        data: {
          call_id: currentRoom
        }
      };

      sendMessage(message);
      
      const leaveMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `Left call room ${currentRoom}`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, leaveMessage]);
    }
    
    setCurrentRoom(null);
    setIsInCall(false);
  };

  const toggleCallSetting = (setting: keyof typeof callSettings) => {
    setCallSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Simulate call setting change message
    const settingMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `${setting} ${callSettings[setting] ? 'disabled' : 'enabled'}`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, settingMessage]);
  };

  const updateCallStatus = (status: string) => {
    if (!currentRoom) return;

    const message: WebSocketMessage = {
      type: 'call_status_update',
      data: {
        call_id: currentRoom,
        status: status
      }
    };

    sendMessage(message);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'call_update':
        return <Phone className="h-4 w-4 text-blue-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-green-500" />;
    }
  };

  const getMessageBg = (type: string) => {
    switch (type) {
      case 'call_update':
        return 'bg-blue-50 border-blue-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Real-time Messaging Test</h1>
          <p className="text-secondary-600 mt-1">
            Test real-time messaging and call room functionality
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          {currentRoom && (
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Room {currentRoom}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Room Controls */}
        <div className="card">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Call Room Controls</span>
          </h3>
          
          <div className="space-y-4">
            {!isInCall ? (
              <div className="space-y-3">
                <p className="text-sm text-secondary-600">Join a call room to start messaging</p>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(roomId => (
                    <button
                      key={roomId}
                      onClick={() => joinCallRoom(roomId)}
                      disabled={!isConnected}
                      className="btn-outline disabled:opacity-50"
                    >
                      Join Room {roomId}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    Currently in call room {currentRoom}
                  </p>
                </div>
                
                {/* Call Settings */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-secondary-700">Call Settings</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleCallSetting('microphone')}
                      className={`p-2 rounded-md flex items-center justify-center space-x-2 ${
                        callSettings.microphone
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {callSettings.microphone ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => toggleCallSetting('camera')}
                      className={`p-2 rounded-md flex items-center justify-center space-x-2 ${
                        callSettings.camera
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {callSettings.camera ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => toggleCallSetting('volume')}
                      className={`p-2 rounded-md flex items-center justify-center space-x-2 ${
                        callSettings.volume
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {callSettings.volume ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Call Status Updates */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-secondary-700">Update Call Status</p>
                  <div className="space-y-2">
                    {['processing', 'completed', 'failed'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateCallStatus(status)}
                        className="btn-outline w-full text-sm"
                      >
                        Set {status}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={leaveCallRoom}
                  className="btn-outline w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  Leave Room
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Real-time Messages</span>
          </h3>
          
          <div className="space-y-4">
            {/* Messages Container */}
            <div className="h-96 overflow-y-auto border border-secondary-200 rounded-md p-4 space-y-3">
              {chatMessages.length > 0 ? (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-md border ${getMessageBg(message.type)}`}
                  >
                    <div className="flex items-start space-x-2">
                      {getMessageIcon(message.type)}
                      <div className="flex-1">
                        <p className="text-sm text-secondary-900">{message.content}</p>
                        <p className="text-xs text-secondary-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-secondary-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Join a call room to start messaging</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="input flex-1"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                disabled={!isConnected || !isInCall}
              />
              <button
                onClick={sendChatMessage}
                disabled={!isConnected || !isInCall || !inputMessage.trim()}
                className="btn-primary disabled:opacity-50 flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            
            {!isInCall && (
              <p className="text-sm text-secondary-500 text-center">
                Join a call room to send messages
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMessaging;