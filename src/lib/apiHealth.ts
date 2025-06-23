import { api } from '../services/api';

/**
 * API Health Check Utility
 * 
 * This utility helps verify if the backend API is accessible and properly configured.
 * It provides functions to test API connectivity and validate environment settings.
 */

export interface HealthStatus {
  status: 'ok' | 'error';
  message: string;
  details?: Record<string, any>;
}

/**
 * Check if the backend API is accessible
 */
export const checkApiHealth = async (): Promise<HealthStatus> => {
  try {
    // Try the health endpoint first
    const response = await api.get('/health', { 
      timeout: 3000, // 3 second timeout
      validateStatus: (status) => status < 500 // Don't throw for 404
    });
    
    // If we get any response, consider it healthy
    if (response.status === 200) {
      return {
        status: 'ok',
        message: 'Backend API is accessible',
        details: response.data
      };
    }
    
    // If we get a 404, the endpoint might not exist but the server is up
    if (response.status === 404) {
      return {
        status: 'ok',
        message: 'Backend is running (health endpoint not found)',
        details: response.data
      };
    }
    
    // For other status codes, return an error
    throw new Error(`Unexpected status: ${response.status}`);
    
  } catch (error: any) {
    console.error('API health check failed:', error);
    return {
      status: 'error',
      message: 'Failed to connect to backend API',
      details: {
        error: error.message,
        config: {
          baseURL: api.defaults.baseURL,
        }
      }
    };
  }
};

/**
 * Validate environment configuration
 */
export const validateEnvironment = (): Record<string, string | undefined> => {
  return {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    WS_URL: import.meta.env.VITE_WS_URL,
    NODE_ENV: import.meta.env.MODE
  };
};

/**
 * Log application environment details to console
 * This is useful for debugging deployment issues
 */
export const logEnvironmentInfo = (): void => {
  const envInfo = validateEnvironment();
  console.group('MeshMemory Environment');
  console.log('API Base URL:', envInfo.API_BASE_URL || 'http://localhost:8000/api (default)');
  console.log('WebSocket URL:', envInfo.WS_URL || 'ws://localhost:8000/ws (default)');
  console.log('Environment:', envInfo.NODE_ENV || 'development');
  console.groupEnd();
};
