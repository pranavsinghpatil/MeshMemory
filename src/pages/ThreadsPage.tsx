import React, { useState, useEffect } from 'react';
import { Layers, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import ThreadCard from '../components/ThreadCard';
import { threadsAPI } from '../lib/api';

export default function ThreadsPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('updated_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchThreads();
  }, [sortBy]);

  async function fetchThreads() {
    try {
      setLoading(true);
      const data = await threadsAPI.getAllThreads();
      
      // Sort threads based on selected criteria
      const sortedThreads = [...data].sort((a: any, b: any) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else {
          // For dates (updated_at or created_at)
          return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
        }
      });
      
      setThreads(sortedThreads);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thread Explorer</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                  Discover conversation patterns and topics across your sources
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    List
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="updated_at">Recently Updated</option>
                  <option value="created_at">Recently Created</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-2xl transition-colors">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Threads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {threads.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-2xl transition-colors">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Messages
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {threads.reduce((sum, thread: any) => sum + thread.chunkCount, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-2xl transition-colors">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Avg. Thread Size
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {threads.length > 0 
                          ? Math.round(threads.reduce((sum, thread: any) => sum + thread.chunkCount, 0) / threads.length)
                          : 0
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Threads Display */}
          {threads.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" 
                : "space-y-4"
            }>
              {threads.map((thread: any) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 shadow-md rounded-2xl transition-colors">
              <Layers className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No threads found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Import some conversations to start discovering thread patterns.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Import missing component
import { TrendingUp, MessageSquare } from 'lucide-react';