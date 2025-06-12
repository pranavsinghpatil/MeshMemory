import { useState, useEffect } from 'react';
import { threadsAPI } from '../lib/api';
import { useAppStore } from '../store/useStore';

export function useFetchThreadGroups() {
  const [threadGroups, setThreadGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentWorkspace = useAppStore(state => state.currentWorkspace);

  useEffect(() => {
    const fetchThreadGroups = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await threadsAPI.getAllThreadGroups();
        
        // Filter by current workspace in a real implementation
        // For now, we'll just use the data as is
        setThreadGroups(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching thread groups:', error);
        setError('Failed to load thread groups');
        setLoading(false);
      }
    };
    
    fetchThreadGroups();
  }, [currentWorkspace.id]);

  return { threadGroups, loading, error, refetch: () => {} };
}