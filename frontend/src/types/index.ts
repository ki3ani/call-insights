export * from './api';

// Additional utility types
export interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  connectionState: WebSocketState;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  connect: (token: string) => void;
  disconnect: () => void;
}

// Re-export commonly used types
export type { User, Call, Company, Token, WebSocketMessage, CallStatus, WebSocketState } from './api';