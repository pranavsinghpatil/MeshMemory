import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, TrendingUp, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSources: 0,
    totalThreads: 0,
    totalConversations: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentThreads, setRecentThreads] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">
              Start your intelligent AI conversation journey with KnitChat
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Sources
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalSources}
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
                        Active Threads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalThreads}
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
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Conversations
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
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
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity: any) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-indigo-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title || 'Untitled Source'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.type} • {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Threads */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Threads
                </h3>
                <div className="space-y-4">
                  {recentThreads.length > 0 ? (
                    recentThreads.map((thread: any) => (
                      <Link
                        key={thread.id}
                        to={`/threads`}
                        className="block hover:bg-gray-50 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {thread.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Updated {new Date(thread.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No threads yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg">
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