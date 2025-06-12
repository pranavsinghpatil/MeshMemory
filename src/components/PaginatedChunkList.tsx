import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ConversationChunk from './ConversationChunk';

interface PaginatedChunkListProps {
  sourceId?: string;
  threadId?: string;
  onFollowUp: (chunk: any) => void;
  onPinToThread: (chunk: any) => void;
  onSeeContext: (chunk: any) => void;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function PaginatedChunkList({
  sourceId,
  threadId,
  onFollowUp,
  onPinToThread,
  onSeeContext
}: PaginatedChunkListProps) {
  const [chunks, setChunks] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChunks = useCallback(async (page: number = 1) => {
    if (!sourceId && !threadId) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = sourceId 
        ? `/api/sources/${sourceId}/chunks`
        : `/api/threads/${threadId}/chunks`;
      
      const response = await fetch(`${endpoint}?page=${page}&limit=${pagination.limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chunks');
      }

      const data = await response.json();
      setChunks(data.chunks);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching chunks:', error);
      setError('Failed to load chunks');
    } finally {
      setLoading(false);
    }
  }, [sourceId, threadId, pagination.limit]);

  useEffect(() => {
    fetchChunks(1);
  }, [fetchChunks]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchChunks(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchChunks(1);
  };

  if (loading && chunks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => fetchChunks(pagination.page)}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pagination Controls - Top */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total_count)} of{' '}
            {pagination.total_count} chunks
          </span>
          
          <select
            value={pagination.limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.has_prev || loading}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.has_next || loading}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chunks List */}
      <div className="space-y-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        )}
        
        {chunks.map((chunk) => (
          <ConversationChunk
            key={chunk.id}
            chunk={chunk}
            onFollowUp={onFollowUp}
            onPinToThread={onPinToThread}
            onSeeContext={onSeeContext}
          />
        ))}
      </div>

      {/* Pagination Controls - Bottom */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1 || loading}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            First
          </button>
          
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.has_prev || loading}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
            const pageNum = Math.max(1, pagination.page - 2) + i;
            if (pageNum > pagination.total_pages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={loading}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  pageNum === pagination.page
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.has_next || loading}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
          
          <button
            onClick={() => handlePageChange(pagination.total_pages)}
            disabled={pagination.page === pagination.total_pages || loading}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}