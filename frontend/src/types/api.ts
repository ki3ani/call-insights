// Base types
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Company types
export interface Company extends BaseEntity {
  name: string;
  domain: string;
  industry?: string;
}

export interface CompanyCreate {
  name: string;
  domain: string;
  industry?: string;
}

// User types
export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  company_id: number;
}

export interface UserCreate {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role?: string;
  company_id: number;
}

export interface UserLogin {
  email: string;
  password: string;
}

// Call types
export interface Call extends BaseEntity {
  title: string;
  description?: string;
  duration?: number;
  status: CallStatus;
  audio_url?: string;
  transcript?: string;
  summary?: string;
  insights?: Record<string, any>;
  sentiment_score?: number;
  confidence_score?: number;
  user_id: number;
  company_id: number;
}

export interface CallCreate {
  title: string;
  description?: string;
  duration?: number;
  audio_url?: string;
  user_id: number;
  company_id: number;
}

export interface CallUpdate {
  title?: string;
  description?: string;
  status?: CallStatus;
  transcript?: string;
  summary?: string;
  insights?: Record<string, any>;
  sentiment_score?: number;
  confidence_score?: number;
}

export type CallStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Authentication types
export interface Token {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id: number;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data: Record<string, any>;
  user_id?: number;
  call_id?: number;
  from_user?: number;
  timestamp?: string;
}

export interface WebSocketConnectionMessage extends WebSocketMessage {
  type: 'connection_established';
  data: {
    user_id: number;
    message: string;
  };
}

export interface WebSocketCallStatusMessage extends WebSocketMessage {
  type: 'call_status_updated';
  data: {
    call_id: number;
    status: CallStatus;
    updated_by: number;
  };
}

export interface WebSocketPingMessage extends WebSocketMessage {
  type: 'ping';
  data: {};
}

export interface WebSocketPongMessage extends WebSocketMessage {
  type: 'pong';
  data: {
    timestamp: string;
  };
}

// Health check types
export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
}

export interface DetailedHealthCheck extends HealthCheck {
  version: string;
  database: {
    status: 'healthy' | 'unhealthy';
    error?: string;
  };
  system: {
    cpu_usage_percent: number;
    memory_usage_percent: number;
    memory_available_gb: number;
    disk_usage_percent: number;
    disk_free_gb: number;
  };
  environment: {
    python_version: string;
    platform: string;
  };
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

// Filter types
export interface CallFilters extends PaginationParams {
  status?: CallStatus;
  user_id?: number;
}

// WebSocket connection states
export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error';

// Chart data types for dashboard
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

export interface CallMetrics {
  total_calls: number;
  pending_calls: number;
  processing_calls: number;
  completed_calls: number;
  failed_calls: number;
  average_duration: number;
  average_sentiment: number;
}