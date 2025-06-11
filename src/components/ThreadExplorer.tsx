import React, { useState, useEffect } from 'react';
import { Layers, MessageSquare, ArrowRightLeft as ArrowsRightLeft, Scissors, AlertCircle, Loader2 } from 'lucide-react';
import { threadsAPI } from '../lib/api';
import ThreadCard from './ThreadCard';

interface ThreadExplorerProps {
  threadId?: string;
}

export default function ThreadExplorer({ threadId }: ThreadExplorerProps) {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [targetThread, setTargetThread] = useState<string>('');
  const [splitChunkId, setSplitChunkId] = useState<string>('');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (threadId && threads.length > 0) {
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        setSelectedThread(thread);
      }
    }
  }, [threadId, threads]);

  async function fetchThreads() {
    try {
      setLoading(true);
      const data = await threadsAPI.getAllThreads();
      setThreads(data);
      
      // If threadId is provided, select that thread
      if (threadId) {
        const thread = data.find((t: any) => t.id === threadId);
        if (thread) {
          setSelectedThread(thread);
        }
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      setError('Failed to load threads');
    } finally {
      setLoading(false);
    }
  }

  const handleMergeThreads = async () => {
    if (!selectedThread || !targetThread) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      await threadsAPI.mergeThreads(selectedThread.id, targetThread);
      
      setSuccess(`Successfully merged thread into "${threads.find(t => t.id === targetThread)?.title}"`);
      setShowMergeModal(false);
      
      // Refresh threads
      await fetchThreads();
    } catch (error) {
      console.error('Error merging threads:', error);
      setError('Failed to merge threads');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSplitThread = async () => {
    if (!selectedThread || !splitChunkId) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      await threadsAPI.splitThread(selectedThread.id, splitChunkId);
      
      setSuccess('Successfully split thread');
      setShowSplitModal(false);
      
      // Refresh threads
      await fetchThreads();
    } catch (error) {
      console.error('Error splitting thread:', error);
      setError('Failed to split thread');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thread Actions */}
      {selectedThread && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedThread.title}
              </h2>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMergeModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <ArrowsRightLeft className="h-4 w-4 mr-2" />
                Merge With...
              </button>
              
              <button
                onClick={() => setShowSplitModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Scissors className="h-4 w-4 mr-2" />
                Split Thread
              </button>
            </div>
          </div>
          
          {/* Thread details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(selectedThread.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="text-xs text-gray-500 dark:text-gray-400">Messages</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedThread.chunkCount}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <p className="text-xs text-gray-500 dark:text-gray-400">Topics</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedThread.topics.map((topic: string) => (
                  <span key={topic} className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Error/Success messages */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mb-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 mr-2" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md mb-4">
              <div className="flex">
                <MessageSquare className="h-5 w-5 text-green-400 dark:text-green-500 mr-2" />
                <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Threads List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
      }>
        {threads.map((thread) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            viewMode={viewMode}
          />
        ))}
      </div>

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowMergeModal(false)} />
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                    <ArrowsRightLeft className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Merge Thread
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select a thread to merge "{selectedThread?.title}" into. This action cannot be undone.
                      </p>
                      
                      <div className="mt-4">
                        <label htmlFor="targetThread" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Target Thread
                        </label>
                        <select
                          id="targetThread"
                          value={targetThread}
                          onChange={(e) => setTargetThread(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select a thread</option>
                          {threads
                            .filter(t => t.id !== selectedThread?.id)
                            .map(thread => (
                              <option key={thread.id} value={thread.id}>
                                {thread.title} ({thread.chunkCount} messages)
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleMergeThreads}
                  disabled={!targetThread || actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Merging...
                    </>
                  ) : (
                    'Merge Threads'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Split Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowSplitModal(false)} />
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Scissors className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Split Thread
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select a message to split the thread at. All messages after the selected one will be moved to a new thread.
                      </p>
                      
                      <div className="mt-4">
                        <label htmlFor="splitChunk" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Split Point
                        </label>
                        <select
                          id="splitChunk"
                          value={splitChunkId}
                          onChange={(e) => setSplitChunkId(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select a message</option>
                          {/* In a real implementation, you would fetch and display actual chunks */}
                          <option value="chunk1">Message 1: "Hello, I need help with..."</option>
                          <option value="chunk2">Message 2: "I can help you with that..."</option>
                          <option value="chunk3">Message 3: "Thanks, now I have another question..."</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSplitThread}
                  disabled={!splitChunkId || actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Splitting...
                    </>
                  ) : (
                    'Split Thread'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSplitModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}