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
  importGrouped: async (formData: FormData) => {
    const response = await api.post('/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  createHybrid: async (payload: { chatIds: string[]; title: string; metadata?: any; sortMethod?: string; }) => {
    const response = await api.post('/hybrid/create', payload);
    return response.data;
  },
};

// Conversations API

// Convenience exports
export const { importSource, importGrouped, createHybrid } = importAPI;

export const conversationsAPI = {
  getConversation: async (sourceId: string, includeMicroThreads = true) => {
    try {
      const response = await api.get(`/conversations/${sourceId}`, {
        params: { include_micro_threads: includeMicroThreads }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      // Return mock data for demo purposes
      return {
        sourceId,
        title: 'React State Management Discussion',
        sourceType: 'chatgpt-link',
        chunks: [
          {
            id: 'chunk-1',
            text: "What's the best way to manage state in a React application?",
            participantLabel: 'User',
            timestamp: '2024-01-15T10:30:00Z',
            modelName: null,
            microThreads: []
          },
          {
            id: 'chunk-2',
            text: "The best approach depends on your application's complexity. For simple local state, useState is perfect. For more complex state logic, useReducer provides a more predictable state management pattern. For global state that needs to be accessed by many components, you might use Context API or external libraries like Redux or Zustand.",
            participantLabel: 'Assistant',
            timestamp: '2024-01-15T10:31:00Z',
            modelName: 'gpt-4',
            microThreads: []
          }
        ],
        metadata: {}
      };
    }
  },
  
  getConversationChunks: async (sourceId: string) => {
    const response = await api.get(`/conversations/${sourceId}/chunks`);
    return response.data;
  },
  
  getConversationMetadata: async (sourceId: string) => {
    const response = await api.get(`/conversations/${sourceId}/metadata`);
    return response.data;
  },
  
  getConversationSummary: async (sourceId: string, regenerate = false) => {
    try {
      const response = await api.get(`/conversations/${sourceId}/summary`, {
        params: { regenerate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation summary:', error);
      // Return mock data for demo purposes
      return {
        sourceId,
        summary: "This conversation covers React state management, hooks, and performance optimization techniques. The user asks about best practices for managing state in React applications, and the assistant provides detailed explanations about useState, useReducer, Context API, and external libraries like Redux and Zustand. The discussion also touches on performance considerations when using Context and strategies to minimize unnecessary re-renders."
      };
    }
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

// Chats API
export const chatsAPI = {
  getAllChats: async () => {
    try {
      const response = await api.get('/chats');
      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
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
    try {
      const response = await api.get(`/threads/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching thread:', error);
      // Return mock data for demo purposes
      return {
        id: threadId,
        title: 'React Best Practices Discussion',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-16T14:20:00Z',
        summary: "This thread discusses React best practices, focusing on state management, component architecture, and performance optimization. Key topics include using hooks effectively, managing global state with Context API or Redux, implementing code splitting, and optimizing renders with useMemo and useCallback.",
        topics: ['React', 'JavaScript', 'Performance', 'Architecture'],
      };
    }
  },
  
  getRelatedChats: async (threadId: string) => {
    try {
      const response = await api.get(`/threads/${threadId}/related`);
      return response.data;
    } catch (error) {
      console.error('Error fetching related threads:', error);
      // Return mock data for demo purposes
      return [
        { id: 'thread-1', title: 'React Hooks Discussion', similarity: 0.87 },
        { id: 'thread-2', title: 'State Management Patterns', similarity: 0.82 },
        { id: 'thread-3', title: 'Frontend Performance Tips', similarity: 0.76 },
      ];
    }
  },
  
  autoGenerateChats: async () => {
    const response = await api.post('/threads/auto-generate');
    return response.data;
  },
  
  getChatStats: async () => {
    const response = await api.get('/threads/stats');
    return response.data;
  },
  
  mergeChats: async (threadId: string, targetThreadId: string) => {
    const response = await api.post(`/threads/${threadId}/merge`, {
      targetThreadId
    });
    return response.data;
  },
  
  splitChat: async (threadId: string, chunkId: string) => {
    const response = await api.post(`/threads/${threadId}/split`, {
      chunkId
    });
    return response.data;
  },
  
  regenerateChatSummary: async (threadId: string) => {
    try {
      const response = await api.post(`/threads/${threadId}/summary/regenerate`);
      return response.data;
    } catch (error) {
      console.error('Error regenerating summary:', error);
      // Return mock data for demo purposes
      return {
        threadId,
        summary: "This thread discusses React best practices, focusing on state management, component architecture, and performance optimization. Key topics include using hooks effectively, managing global state with Context API or Redux, implementing code splitting, and optimizing renders with useMemo and useCallback.",
        keyTopics: ['React', 'Hooks', 'State Management', 'Performance'],
        generatedAt: new Date().toISOString(),
        modelUsed: 'gpt-4'
      };
    }
  },
  
  // Thread Groups API
  getAllChatGroups: async () => {
    try {
      const response = await api.get('/threadgroups');
      return response.data;
    } catch (error) {
      console.error('Error fetching thread groups:', error);
      // Return mock data for demo purposes
      return [
        {
          id: '1',
          title: 'React State Management',
          tags: ['React', 'JavaScript', 'Hooks', 'State'],
          memberCount: 3,
          updated_at: '2024-01-15T10:30:00Z',
          summary: 'Discussions about React state management approaches including useState, useReducer, Context API, and external libraries like Redux and Zustand.'
        },
        {
          id: '2',
          title: 'Machine Learning Fundamentals',
          tags: ['ML', 'AI', 'Python', 'Data Science'],
          memberCount: 5,
          updated_at: '2024-01-14T09:15:00Z',
          summary: 'Exploration of machine learning concepts, algorithms, and implementation approaches using Python and popular frameworks.'
        }
      ];
    }
  },
  
  getThreadGroup: async (groupId: string) => {
    try {
      const response = await api.get(`/threadgroups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching thread group:', error);
      // Return mock data for demo purposes
      return {
        id: groupId,
        title: 'React State Management',
        tags: ['React', 'JavaScript', 'Hooks', 'State'],
        summary: 'This thread group combines conversations about React state management, hooks, and performance optimization. Key topics include useState vs useReducer, Context API usage, and strategies to minimize re-renders.',
        memberCount: 3,
        created_at: '2024-01-10T10:30:00Z',
        updated_at: '2024-01-15T14:20:00Z'
      };
    }
  },
  
  getChatGroupMembers: async (groupId: string) => {
    try {
      const response = await api.get(`/threadgroups/${groupId}/members`);
      return response.data;
    } catch (error) {
      console.error('Error fetching thread group members:', error);
      // Return mock data for demo purposes
      return [
        {
          id: 'chat-1',
          title: 'React Hooks Best Practices',
          type: 'chatgpt-link',
          created_at: '2024-01-10T10:30:00Z'
        },
        {
          id: 'chat-2',
          title: 'Context API vs Redux',
          type: 'chatgpt-link',
          created_at: '2024-01-12T15:45:00Z'
        },
        {
          id: 'chat-3',
          title: 'Performance Optimization in React',
          type: 'youtube-link',
          created_at: '2024-01-14T09:20:00Z'
        }
      ];
    }
  },
  
  getFusedChat: async (groupId: string) => {
    try {
      const response = await api.get(`/threadgroups/${groupId}/fused`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fused conversation:', error);
      // Return mock data for demo purposes
      return [
        {
          id: 'chunk-1',
          text_chunk: "What's the best way to manage state in a React application?",
          participant_label: 'User',
          timestamp: '2024-01-10T10:31:00Z',
          source_title: 'React Hooks Best Practices'
        },
        {
          id: 'chunk-2',
          text_chunk: "The best approach depends on your application's complexity. For simple local state, useState is perfect. For more complex state logic, useReducer provides a more predictable state management pattern. For global state that needs to be accessed by many components, you might use Context API or external libraries like Redux or Zustand.",
          participant_label: 'Assistant',
          timestamp: '2024-01-10T10:32:00Z',
          source_title: 'React Hooks Best Practices'
        }
      ];
    }
  },
  
  getRelatedChatGroups: async (groupId: string) => {
    try {
      const response = await api.get(`/threadgroups/${groupId}/related`);
      return response.data;
    } catch (error) {
      console.error('Error fetching related groups:', error);
      // Return mock data for demo purposes
      return [
        {
          id: 'group-1',
          title: 'Frontend Architecture',
          tags: ['React', 'Architecture', 'Design Patterns'],
          memberCount: 4,
          similarity: 0.82
        },
        {
          id: 'group-2',
          title: 'JavaScript Frameworks Comparison',
          tags: ['JavaScript', 'React', 'Vue', 'Angular'],
          memberCount: 3,
          similarity: 0.75
        }
      ];
    }
  },
  
  updateChatGroup: async (groupId: string, data: any) => {
    try {
      const response = await api.put(`/threadgroups/${groupId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating thread group:', error);
      // Return mock success for demo purposes
      return { success: true };
    }
  },
  
  sendMessageToChatGroup: async (groupId: string, message: string) => {
    try {
      const response = await api.post(`/threadgroups/${groupId}/message`, { message });
      return response.data;
    } catch (error) {
      console.error('Error sending message to group:', error);
      // Return mock success for demo purposes
      return { success: true };
    }
  }
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

// User API
export const userAPI = {
  getApiKeys: async () => {
    try {
      const response = await api.get('/user/settings/api-keys');
      return response.data;
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return {};
    }
  },
  
  saveApiKeys: async (keys: Record<string, string>) => {
    const response = await api.post('/user/settings/api-keys', { keys });
    return response.data;
  },
  
  testApiKey: async (provider: string, key: string) => {
    const response = await api.post('/user/settings/test-api-key', {
      provider,
      key
    });
    return response.data;
  },
  
  getSettings: async () => {
    const response = await api.get('/user/settings');
    return response.data;
  },
  
  updateSettings: async (settings: Record<string, any>) => {
    const response = await api.post('/user/settings', settings);
    return response.data;
  }
};

export default api;