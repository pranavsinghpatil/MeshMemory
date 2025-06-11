import React, { useState, useEffect } from 'react';
import { Layers, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function ThreadsPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('updated_at');

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
      })) || [];

      setThreads(threadsWithCounts);
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
                <h1 className="text-3xl font-bold text-gray-900">Explore Threads</h1>
                <p className="mt-2 text-lg text-gray-600">
                  Discover conversation patterns and topics across your sources
                </p>
              </div>
              <div className="flex items-center space-x-4">
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
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Layers className="h-6 w-6 text-gray-400" />
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

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
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

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
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

          {/* Threads Grid */}
          {threads.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {threads.map((thread: any) => (
                <div
                  key={thread.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Layers className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {thread.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {thread.chunkCount} message{thread.chunkCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        Created {new Date(thread.created_at).toLocaleDateString()}
                      </div>
                      {thread.updated_at !== thread.created_at && (
                        <div className="flex items-center text-sm text-gray-500">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Updated {new Date(thread.updated_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {thread.metadata && Object.keys(thread.metadata).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(thread.metadata).slice(0, 3).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {key}: {String(value).slice(0, 20)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white shadow rounded-lg">
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