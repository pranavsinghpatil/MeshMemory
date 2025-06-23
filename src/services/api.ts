import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from './auth';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies if using httpOnly
});

// Flag to prevent multiple token refresh requests
let isRefreshing = false;
let failedQueue: Array<{resolve: (token: string) => void, reject: (error: any) => void}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Skip auth header for login/register endpoints
    const isAuthEndpoint = config.url?.includes('/auth/');
    if (isAuthEndpoint) {
      return config;
    }

    try {
      const token = await authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      // Continue without token if we can't get one
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If error is not 401, reject immediately
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // If we already tried to refresh the token and failed, or it's a refresh token request
    if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
      // Clear auth data and redirect to login
      authService.clearAuthData();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If we're currently refreshing, add the request to the queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(async (token) => {
          const accessToken = await token;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Set flag and try to refresh the token
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Get a fresh token
      const token = await authService.getToken();
      
      // Process the queue with the new token
      processQueue(null, token);
      
      // Retry the original request with the new token
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Clear auth data and redirect to login
      processQueue(refreshError, null);
      authService.clearAuthData();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// API Error type
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status?: number;
  statusText?: string;
}

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}
