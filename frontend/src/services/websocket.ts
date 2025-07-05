import { WebSocketMessage, WebSocketState } from '@/types';

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private stateHandlers: Map<string, (state: WebSocketState) => void> = new Map();
  private currentState: WebSocketState = 'disconnected';

  constructor(baseUrl: string = 'ws://localhost:8000') {
    this.url = baseUrl;
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.token = token;
      this.setState('connecting');

      try {
        const wsUrl = `${this.url}/ws/connect?token=${encodeURIComponent(token)}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.setState('connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.setState('disconnected');
          this.socket = null;

          // Attempt to reconnect if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.setState('error');
          reject(error);
        };
      } catch (error) {
        this.setState('error');
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }
    this.setState('disconnected');
  }

  sendMessage(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  onMessage(type: string, handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  offMessage(type: string): void {
    this.messageHandlers.delete(type);
  }

  onStateChange(id: string, handler: (state: WebSocketState) => void): void {
    this.stateHandlers.set(id, handler);
  }

  offStateChange(id: string): void {
    this.stateHandlers.delete(id);
  }

  getState(): WebSocketState {
    return this.currentState;
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle specific message types
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    // Handle general message listeners
    const generalHandler = this.messageHandlers.get('*');
    if (generalHandler) {
      generalHandler(message);
    }
  }

  private setState(state: WebSocketState): void {
    this.currentState = state;
    this.stateHandlers.forEach(handler => handler(state));
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.token) {
        this.connect(this.token).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  // Utility methods for common message types
  sendPing(): void {
    this.sendMessage({
      type: 'ping',
      data: {}
    });
  }

  sendCallStatusUpdate(callId: number, status: string): void {
    this.sendMessage({
      type: 'call_status_update',
      data: {
        call_id: callId,
        status: status
      }
    });
  }

  joinCallRoom(callId: number): void {
    this.sendMessage({
      type: 'join_call_room',
      data: {
        call_id: callId
      }
    });
  }

  leaveCallRoom(callId: number): void {
    this.sendMessage({
      type: 'leave_call_room',
      data: {
        call_id: callId
      }
    });
  }
}

// Singleton instance
export const websocketService = new WebSocketService();