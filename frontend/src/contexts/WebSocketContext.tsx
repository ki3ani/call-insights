import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { WebSocketMessage, WebSocketState } from '@/types';
import { websocketService } from '@/services/websocket';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: WebSocketState;
  lastMessage: WebSocketMessage | null;
  messages: WebSocketMessage[];
  sendMessage: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
  clearMessages: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] = useState<WebSocketState>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up WebSocket state change listener
  useEffect(() => {
    const handleStateChange = (state: WebSocketState) => {
      setConnectionState(state);
    };

    websocketService.onStateChange('main', handleStateChange);

    return () => {
      websocketService.offStateChange('main');
    };
  }, []);

  // Set up message listener
  useEffect(() => {
    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message);
      setMessages(prev => {
        const newMessages = [...prev, message];
        // Keep only last 100 messages to prevent memory issues
        return newMessages.slice(-100);
      });
    };

    websocketService.onMessage('*', handleMessage);

    return () => {
      websocketService.offMessage('*');
    };
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token && connectionState === 'disconnected') {
      connect();
    } else if (!isAuthenticated && connectionState !== 'disconnected') {
      disconnect();
    }
  }, [isAuthenticated, token, connectionState]);

  // Set up ping interval to keep connection alive
  useEffect(() => {
    let pingInterval: NodeJS.Timeout | null = null;

    if (connectionState === 'connected') {
      pingInterval = setInterval(() => {
        websocketService.sendPing();
      }, 30000); // Send ping every 30 seconds
    }

    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, [connectionState]);

  const connect = async (): Promise<void> => {
    if (!token) {
      console.error('Cannot connect WebSocket: No token available');
      return;
    }

    try {
      await websocketService.connect(token);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      
      // Schedule reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isAuthenticated && token) {
          connect();
        }
      }, 5000);
    }
  };

  const disconnect = (): void => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    websocketService.disconnect();
  };

  const sendMessage = (message: WebSocketMessage): void => {
    if (connectionState === 'connected') {
      websocketService.sendMessage(message);
    } else {
      console.error('Cannot send message: WebSocket is not connected');
    }
  };

  const clearMessages = (): void => {
    setMessages([]);
    setLastMessage(null);
  };

  const value: WebSocketContextType = {
    isConnected: connectionState === 'connected',
    connectionState,
    lastMessage,
    messages,
    sendMessage,
    connect,
    disconnect,
    clearMessages,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};