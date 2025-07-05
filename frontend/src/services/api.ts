import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  Call,
  Company,
  Token,
  UserCreate,
  UserLogin,
  CallCreate,
  CallUpdate,
  CompanyCreate,
  CallFilters,
  HealthCheck,
  DetailedHealthCheck,
  WebSocketMessage
} from '@/types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // Redirect to login or dispatch logout action
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  // Health endpoints
  async healthCheck(): Promise<HealthCheck> {
    const response: AxiosResponse<HealthCheck> = await this.api.get('/health/');
    return response.data;
  }

  async detailedHealthCheck(): Promise<DetailedHealthCheck> {
    const response: AxiosResponse<DetailedHealthCheck> = await this.api.get('/health/detailed');
    return response.data;
  }

  // Authentication endpoints
  async register(userData: UserCreate): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/api/users/register', userData);
    return response.data;
  }

  async login(credentials: UserLogin): Promise<Token> {
    const response: AxiosResponse<Token> = await this.api.post('/api/users/login', credentials);
    this.setToken(response.data.access_token);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/api/users/me');
    return response.data;
  }

  // Company endpoints
  async getCompanies(skip = 0, limit = 100): Promise<Company[]> {
    const response: AxiosResponse<Company[]> = await this.api.get('/api/companies/', {
      params: { skip, limit }
    });
    return response.data;
  }

  async getCompany(id: number): Promise<Company> {
    const response: AxiosResponse<Company> = await this.api.get(`/api/companies/${id}`);
    return response.data;
  }

  async createCompany(companyData: CompanyCreate): Promise<Company> {
    const response: AxiosResponse<Company> = await this.api.post('/api/companies/', companyData);
    return response.data;
  }

  async getMyCompany(): Promise<Company> {
    const response: AxiosResponse<Company> = await this.api.get('/api/companies/me/info');
    return response.data;
  }

  // User endpoints
  async getUsers(skip = 0, limit = 100): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/api/users/', {
      params: { skip, limit }
    });
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/api/users/${id}`);
    return response.data;
  }

  // Call endpoints
  async getCalls(filters: CallFilters = {}): Promise<Call[]> {
    const response: AxiosResponse<Call[]> = await this.api.get('/api/calls/', {
      params: filters
    });
    return response.data;
  }

  async getCall(id: number): Promise<Call> {
    const response: AxiosResponse<Call> = await this.api.get(`/api/calls/${id}`);
    return response.data;
  }

  async createCall(callData: CallCreate): Promise<Call> {
    const response: AxiosResponse<Call> = await this.api.post('/api/calls/', callData);
    return response.data;
  }

  async updateCall(id: number, callData: CallUpdate): Promise<Call> {
    const response: AxiosResponse<Call> = await this.api.put(`/api/calls/${id}`, callData);
    return response.data;
  }

  async deleteCall(id: number): Promise<void> {
    await this.api.delete(`/api/calls/${id}`);
  }

  async getUserCalls(userId: number, skip = 0, limit = 100): Promise<Call[]> {
    const response: AxiosResponse<Call[]> = await this.api.get(`/api/calls/user/${userId}`, {
      params: { skip, limit }
    });
    return response.data;
  }

  // WebSocket endpoints
  async broadcastMessage(message: WebSocketMessage): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/ws/broadcast', message);
    return response.data;
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const apiService = new ApiService();