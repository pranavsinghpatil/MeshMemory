import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Clock, User, Loader2, AlertCircle } from 'lucide-react';

interface ThreadSummaryProps {
  threadId: string;
  initialSummary?: string;
  onSummaryUpdate?: (summary: string) => void;
}

export default function ThreadSummary({ 
  threadId, 
  initialSummary, 
  onSummaryUpdate 
}: ThreadSummaryProps) {
  const [summary, setSummary] = useState(initialSummary || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [keyTopics, setKeyTopics] = useState<string[]>([]);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  useEffect(() => {
    if (!initialSummary) {
      fetchSummary();
    }
  }, [threadId, initialSummary]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/threads/${threadId}/summary`);
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setKeyTopics(data.keyTopics || []);
        setLastGenerated(data.generatedAt);
        setModelUsed(data.modelUsed);
        
        if (onSummaryUpdate) {
          onSummaryUpdate(data.summary);
        }
      } else if (response.status === 404) {
        // No summary exists yet
        setSummary('');
      } else {
        throw new Error('Failed to fetch summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setError('Failed to load summary');
    } finally {
      setLoading(false);
    }
  };

  const regenerateSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/threads/${threadId}/summary/regenerate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setKeyTopics(data.keyTopics || []);
        setLastGenerated(data.generatedAt);
        setModelUsed(data.modelUsed);
        
        if (onSummaryUpdate) {
          onSummaryUpdate(data.summary);
        }
      } else {
        throw new Error('Failed to regenerate summary');
      }
    } catch (error) {
      console.error('Error regenerating summary:', error);
      setError('Failed to regenerate summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
          <span className="text-gray-600 dark:text-gray-300">Generating summary...</span>
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Thread Summary
          </h3>
        </div>
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchSummary}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Thread Summary
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          No summary available for this thread yet.
        </p>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
              Generating...
            </>
          ) : (
            'Generate Summary'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Thread Summary
        </h3>
        <button
          onClick={regenerateSummary}
          disabled={loading}
          className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          title="Regenerate summary"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {summary}
        </p>
      </div>

      {/* Key Topics */}
      {keyTopics.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Topics:</h4>
          <div className="flex flex-wrap gap-2">
            {keyTopics.map((topic, index) => (
              <span
                key={index}
                className="px-2.5 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            {modelUsed && (
              <div className="flex items-center mr-4">
                <User className="h-3 w-3 mr-1" />
                Generated by {modelUsed}
              </div>
            )}
            {lastGenerated && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(lastGenerated).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}