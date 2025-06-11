// Mock data for development and testing

export const mockThreads = [
  {
    id: '1',
    title: 'React Best Practices Discussion',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-16T14:20:00Z',
    chunkCount: 12,
    topics: ['React', 'JavaScript', 'Performance', 'Architecture'],
    metadata: {
      source_types: ['chatgpt-link', 'youtube-link'],
      participants: ['user', 'gpt-4', 'claude'],
    }
  },
  {
    id: '2',
    title: 'AI/ML Career Guidance',
    created_at: '2024-01-14T09:15:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    chunkCount: 8,
    topics: ['Career', 'AI/ML', 'Education'],
    metadata: {
      source_types: ['pdf'],
      participants: ['user', 'gemini'],
    }
  },
  {
    id: '3',
    title: 'Database Design Patterns',
    created_at: '2024-01-13T11:00:00Z',
    updated_at: '2024-01-15T13:30:00Z',
    chunkCount: 15,
    topics: ['Database', 'Architecture', 'Backend'],
    metadata: {
      source_types: ['chatgpt-link'],
      participants: ['user', 'gpt-4'],
    }
  }
];

export const mockSearchResults = [
  {
    id: '1',
    text_chunk: 'React hooks provide a way to use state and lifecycle methods in functional components. The useState hook is particularly useful for managing local component state.',
    similarity: 0.92,
    source: {
      id: 'src-1',
      title: 'React Hooks Tutorial',
      type: 'chatgpt-link',
      created_at: '2024-01-15T10:30:00Z'
    },
    participant_label: 'Assistant',
    timestamp: '2024-01-15T10:35:00Z'
  },
  {
    id: '2',
    text_chunk: 'When building scalable React applications, consider using context for global state management instead of prop drilling.',
    similarity: 0.87,
    source: {
      id: 'src-2',
      title: 'React Architecture Guide',
      type: 'pdf',
      created_at: '2024-01-14T09:15:00Z'
    },
    participant_label: 'Expert',
    timestamp: '2024-01-14T09:20:00Z'
  }
];

export const mockConversationChunks = [
  {
    id: '1',
    text_chunk: 'Hi! I\'m working on a React project and I\'m wondering about the best practices for state management.',
    participant_label: 'User',
    timestamp: '2024-01-15T10:30:00Z',
    model_name: null
  },
  {
    id: '2',
    text_chunk: 'Great question! For React state management, it depends on your app\'s complexity. For simple local state, useState is perfect. For more complex scenarios, consider useReducer or external libraries like Redux or Zustand.',
    participant_label: 'Assistant',
    timestamp: '2024-01-15T10:31:00Z',
    model_name: 'gpt-4'
  },
  {
    id: '3',
    text_chunk: 'What about context? When should I use React Context vs external state management?',
    participant_label: 'User',
    timestamp: '2024-01-15T10:32:00Z',
    model_name: null
  },
  {
    id: '4',
    text_chunk: 'React Context is excellent for sharing data that needs to be accessible by many components at different nesting levels. However, be cautious with performance - context changes cause all consumers to re-render. For frequently changing data, consider external state management.',
    participant_label: 'Assistant',
    timestamp: '2024-01-15T10:33:00Z',
    model_name: 'gpt-4'
  }
];