import { useState } from 'react';
import { searchAPI } from '../lib/api';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (searchQuery: string, options = { limit: 10, threshold: 0.7 }) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchAPI.search(
        searchQuery, 
        options.limit, 
        options.threshold
      );
      
      setResults(response.results || []);
      setAiResponse(response.aiResponse || '');
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  return {
    query,
    setQuery,
    results,
    aiResponse,
    loading,
    error,
    search
  };
}