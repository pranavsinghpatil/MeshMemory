import React, { useState, useEffect } from 'react';
import { Layers, MessageSquare, Clock, TrendingUp, Eye, Calendar, Hash } from 'lucide-react';
import Layout from '../components/Layout';
import ThreadCard from '../components/ThreadCard';
import { supabase } from '../lib/supabase';

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
      const { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          chunks!inner(id)
        `)
        .order(sortBy, { ascending: false });

      if (error) throw error;

      // Group chunks by thread and count them
      const threadsWithCounts = data?.map(thread => ({
        ...thread,
        chunkCount: thread.chunks?.length || 0,
        // Generate dummy topics for now
        topics: generateDummyTopics(),
      })) || [];

      setThreads(threadsWithCounts);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  }

  function generateDummyTopics() {
    const allTopics = [
      'React', 'JavaScript', 'AI/ML', 'Career', 'Productivity', 
      'Design', 'Backend', 'Database', 'DevOps', 'Mobile',
      'Web3', 'Security', 'Testing', 'Performance', 'Architecture'
    ];
    
    // Return 2-4 random topics
    const count = Math.floor(Math.random() * 3) + 2;
    const shuffled = allTopics.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
                <h1 className="text-3xl font-bold text-gray-900">Thread Explorer</h1>
                <p className="mt-2 text-lg text-gray-600">
                  Discover conversation patterns and topics across your sources
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    List
                  </button>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            <div className="bg-white overflow-hidden shadow-md rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Layers className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Threads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {threads.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-md rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Messages
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {threads.reduce((sum, thread: any) => sum + thread.chunkCount, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-md rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg. Thread Size
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
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
            <div className="text-center py-12 bg-white shadow-md rounded-2xl">
              <Layers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No threads found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Import some conversations to start discovering thread patterns.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}