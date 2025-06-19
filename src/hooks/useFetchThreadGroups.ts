import { useState, useEffect } from 'react';
import { chatsAPI } from '../lib/api';
import { useAppStore } from '../store/useStore';

interface ChatGroup {
  id: string;
  title: string;
  description: string;
  memberCount: number;
  chatCount: number;
  updatedAt: string;
  tags: string[];
  isOwner: boolean;
}

export function useFetchChatGroups() {
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentWorkspace = useAppStore(state => state.currentWorkspace);

  useEffect(() => {
    const fetchChatGroups = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await chatsAPI.getAllChatGroups();
        
        // Filter by current workspace in a real implementation
        // For now, we'll just use the data as is
        setChatGroups(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat groups:', error);
        setError('Failed to load chat groups');
        setLoading(false);
      }
    };
    
    fetchChatGroups();
  }, [currentWorkspace.id]);

  return { chatGroups, loading, error, refetch: () => fetchChatGroups() };
}