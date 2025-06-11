import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Import API
export const importAPI = {
  importSource: async (formData: FormData) => {
    const response = await api.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getImportStatus: async (sourceId: string) => {
    const response = await api.get(`/import/status/${sourceId}`);
    return response.data;
  },
};

// Conversations API
export const conversationsAPI = {
  getConversation: async (sourceId: string) => {
    const response = await api.get(`/conversations/${sourceId}`);
    return response.data;
  },
  
  getConversationChunks: async (sourceId: string) => {
    const response = await api.get(`/conversations/${sourceId}/chunks`);
    return response.data;
  },
  
  getConversationMetadata: async (sourceId: string) => {
    const response = await api.get(`/conversations/${sourceId}/metadata`);
    return response.data;
  },
};

// Search API
export const searchAPI = {
  search: async (query: string, limit: number = 10, threshold: number = 0.7) => {
    const response = await api.get('/search', {
      params: { q: query, limit, threshold },
    });
    return response.data;
  },
  
  getSuggestions: async (query: string, limit: number = 5) => {
    const response = await api.get('/search/suggestions', {
      params: { q: query, limit },
    });
    return response.data;
  },
};

// Threads API
export const threadsAPI = {
  getAllThreads: async () => {
    const response = await api.get('/threads');
    return response.data;
  },
  
  getThread: async (threadId: string) => {
    const response = await api.get(`/threads/${threadId}`);
    return response.data;
  },
  
  autoGenerateThreads: async () => {
    const response = await api.post('/threads/auto-generate');
    return response.data;
  },
  
  getThreadStats: async () => {
    const response = await api.get('/threads/stats');
    return response.data;
  },
};

// Micro-threads API
export const microThreadsAPI = {
  createMicroThread: async (chunkId: string, question: string, context?: string) => {
    const response = await api.post('/thread', {
      chunkId,
      question,
      context,
    });
    return response.data;
  },
  
  getMicroThreadsForChunk: async (chunkId: string) => {
    const response = await api.get(`/thread/${chunkId}/micro-threads`);
    return response.data;
  },
};

export default api;