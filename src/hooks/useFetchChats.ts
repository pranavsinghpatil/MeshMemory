import { useState, useEffect } from 'react';
import { conversationsAPI } from '../lib/api';
import { useAppStore } from '../store/useStore';

export function useFetchChats() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentWorkspace = useAppStore(state => state.currentWorkspace);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would be an API call with workspace filter
        // For now, we'll use mock data
        setTimeout(() => {
          const mockChats = [
            {
              id: 'chat-1',
              title: 'React Hooks Best Practices',
              type: 'chatgpt-link',
              created_at: '2024-01-10T10:30:00Z',
              updated_at: '2024-01-10T11:30:00Z',
              workspace_id: currentWorkspace.id
            },
            {
              id: 'chat-2',
              title: 'Context API vs Redux',
              type: 'chatgpt-link',
              created_at: '2024-01-12T15:45:00Z',
              updated_at: '2024-01-12T16:45:00Z',
              workspace_id: currentWorkspace.id
            },
            {
              id: 'chat-3',
              title: 'Performance Optimization in React',
              type: 'youtube-link',
              created_at: '2024-01-14T09:20:00Z',
              updated_at: '2024-01-14T10:20:00Z',
              workspace_id: currentWorkspace.id
            }
          ];
          
          setChats(mockChats);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load chats');
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [currentWorkspace.id]);

  return { chats, loading, error, refetch: () => {} };
}