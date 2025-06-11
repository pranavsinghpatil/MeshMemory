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
  getConversation: async (sourceId: string, includeMicroThreads = true) => {
    const response = await api.get(`/conversations/${sourceId}`, {
      params: { include_micro_threads: includeMicroThreads }
    });
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
  
  getConversationSummary: async (sourceId: string) => {
    const response = await api.get(`/conversations/${sourceId}/summary`);
    return response.data;
  }
};

// Search API
export const searchAPI = {
  search: async (query: string, limit: number = 10, threshold: number = 0.7) => {
    try {
      const response = await api.get('/search', {
        params: { q: query, limit, threshold },
      });
      return response.data;
    } catch (error) {
      console.error('Search API error:', error);
      // Return a fallback response for demo purposes
      return {
        query,
        results: [],
        aiResponse: "I couldn't perform the search due to an error. Please try again later.",
        totalResults: 0
      };
    }
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
    try {
      const response = await api.get('/threads');
      return response.data;
    } catch (error) {
      console.error('Error fetching threads:', error);
      // Return mock data for demo purposes
      return [
        {
          id: '1',
          title: 'React Best Practices Discussion',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-16T14:20:00Z',
          chunkCount: 12,
          topics: ['React', 'JavaScript', 'Performance', 'Architecture'],
        },
        {
          id: '2',
          title: 'AI/ML Career Guidance',
          created_at: '2024-01-14T09:15:00Z',
          updated_at: '2024-01-14T16:45:00Z',
          chunkCount: 8,
          topics: ['Career', 'AI/ML', 'Education'],
        },
        {
          id: '3',
          title: 'Database Design Patterns',
          created_at: '2024-01-13T11:00:00Z',
          updated_at: '2024-01-15T13:30:00Z',
          chunkCount: 15,
          topics: ['Database', 'Architecture', 'Backend'],
        }
      ];
    }
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
    try {
      const response = await api.post('/thread', {
        chunkId,
        question,
        context,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating micro-thread:', error);
      // Return mock data for demo purposes
      return {
        threadId: 'mock-thread-id',
        answer: "I've processed your follow-up question. Based on the context, the answer would involve the specific details you're asking about. This is a simulated response since the API request failed.",
        modelUsed: 'gpt-4',
        timestamp: new Date().toISOString()
      };
    }
  },
  
  getMicroThreadsForChunk: async (chunkId: string) => {
    try {
      const response = await api.get(`/thread/${chunkId}/micro-threads`);
      return response.data;
    } catch (error) {
      console.error('Error fetching micro-threads:', error);
      // Return mock data for demo purposes
      return {
        microThreads: []
      };
    }
  },
};

export default api;