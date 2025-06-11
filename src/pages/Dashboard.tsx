import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, TrendingUp, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSources: 0,
    totalThreads: 0,
    totalConversations: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentThreads, setRecentThreads] = useState([]);
  const { isGuest } = useAuth();

  useEffect(() => {
    if (!isGuest) {
      fetchDashboardData();
    } else {
      // Mock data for guest users
      setStats({
        totalSources: 3,
        totalThreads: 2,
        totalConversations: 8,
      });
      setRecentActivity([
        { id: '1', title: 'React Best Practices', type: 'chatgpt-link', created_at: new Date().toISOString() },
        { id: '2', title: 'AI Career Guide', type: 'pdf', created_at: new Date().toISOString() },
      ]);
      setRecentThreads([
        { id: '1', title: 'Frontend Development', updated_at: new Date().toISOString() },
        { id: '2', title: 'Machine Learning', updated_at: new Date().toISOString() },
      ]);
    }
  }, [isGuest]);

  async function fetchDashboardData() {
    try {
      // Fetch stats
      const [sourcesResult, threadsResult, conversationsResult] = await Promise.all([
        supabase.from('sources').select('id', { count: 'exact' }),
        supabase.from('threads').select('id', { count: 'exact' }),
        supabase.from('micro_threads').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalSources: sourcesResult.count || 0,
        totalThreads: threadsResult.count || 0,
        totalConversations: conversationsResult.count || 0,
      });

      // Fetch recent threads
      const { data: threads } = await supabase
        .from('threads')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

      setRecentThreads(threads || []);

      // Fetch recent activity (sources)
      const { data: sources } = await supabase
        .from('sources')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(sources || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Start your intelligent AI conversation journey with KnitChat
            </p>
            {isGuest && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You're in guest mode with limited features. Sign up for full access to import sources and create threads.
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-2xl transition-colors">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Sources
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.totalSources}
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
                    <TrendingUp className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Active Threads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.totalThreads}
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
                    <Users className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Conversations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.totalConversations}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl transition-colors">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity: any) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.title || 'Untitled Source'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.type} • {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Threads */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl transition-colors">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Recent Threads
                </h3>
                <div className="space-y-4">
                  {recentThreads.length > 0 ? (
                    recentThreads.map((thread: any) => (
                      <Link
                        key={thread.id}
                        to={`/threads`}
                        className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {thread.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Updated {new Date(thread.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No threads yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <div className="px-6 py-8 sm:px-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Welcome to KnitChat
                </h2>
                <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                  Transform your AI conversations into searchable knowledge. Import from ChatGPT, Claude, 
                  Gemini, or YouTube and discover insights across all your interactions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/search"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Start Searching
                  </Link>
                  <Link
                    to="/threads"
                    className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    Explore Threads
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}