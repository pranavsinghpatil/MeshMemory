import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, TrendingUp, Users, Beaker, MessageCircle, Plus, Search, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import FeatureFlag from '../components/FeatureFlag';
import Tooltip from '../components/Tooltip';

interface Chat {
  id: string;
  title: string;
  updated_at: string;
  last_message?: string;
  unread_count?: number;
}

interface ActivityItem {
  id: string;
  title: string;
  type: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSources: 0,
    totalChats: 0,
    totalConversations: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isGuest } = useAuth();

  useEffect(() => {
    if (!isGuest) {
      fetchDashboardData();
    } else {
      // Mock data for guest users
      setTimeout(() => {
        setStats({
          totalSources: 3,
          totalChats: 2,
          totalConversations: 8,
        });
        setRecentActivity([
          { id: '1', title: 'React Best Practices', type: 'chatgpt-link', created_at: new Date().toISOString() },
          { id: '2', title: 'AI Career Guide', type: 'pdf', created_at: new Date().toISOString() },
        ]);
        setRecentChats([
          { id: '1', title: 'Frontend Development', updated_at: new Date().toISOString() },
          { id: '2', title: 'Machine Learning', updated_at: new Date().toISOString() },
        ]);
        setLoading(false);
      }, 800); // Simulate loading delay
    }
  }, [isGuest]);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats
      const [sourcesResult, chatsResult, conversationsResult] = await Promise.all([
        supabase.from('sources').select('id', { count: 'exact' }),
        supabase.from('chats').select('id', { count: 'exact' }),
        supabase.from('conversations').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalSources: sourcesResult.count || 0,
        totalChats: chatsResult.count || 0,
        totalConversations: conversationsResult.count || 0,
      });

      // Fetch recent chats
      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (chatsError) throw chatsError;
      setRecentChats(chats || []);

      // Fetch recent activity
      const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) throw activityError;
      setRecentActivity(activity || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-full">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Start your intelligent AI conversation journey with MeshMemory
            </p>
            {isGuest && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You're in guest mode with limited features. Sign up for full access to import sources and create threads.
                </p>
              </div>
            )}
          </div>

          {error && (
            <ErrorMessage
              message={error}
              onRetry={fetchDashboardData}
              className="mb-8"
            />
          )}

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
              <SkeletonLoader type="card" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
              <Tooltip content="Total number of imported sources">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-2xl transition-colors">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Total Sources
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {stats.totalSources}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Active conversation threads organized by topic">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-2xl transition-colors">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Active Chats
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {stats.totalChats}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Total follow-up conversations created">
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-2xl transition-colors">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            Total Conversations
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                              {stats.totalConversations}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </div>
          )}

          {/* Recent Activity & Threads */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl transition-colors">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                {loading ? (
                  <SkeletonLoader type="list" />
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {activity.type}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                )}
              </div>
            </div>

            {/* Recent Chats */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl transition-colors">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Chats</h2>
                  <Link
                    to="/chat"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View all
                  </Link>
                </div>
                {loading ? (
                  <SkeletonLoader type="list" />
                ) : recentChats.length > 0 ? (
                  <div className="space-y-4">
                    {recentChats.map((chat) => (
                      <Link
                        key={chat.id}
                        to={`/chat/${chat.id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                              <MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {chat.title || 'New Chat'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {chat.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {chat.lastMessageTime ? (
                              new Date(chat.lastMessageTime).toLocaleTimeString()
                            ) : (
                              '--:--'
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No chats yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by creating a new chat.
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/chat"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                      >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        New Chat
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Experimental Features Section */}
          <FeatureFlag flag="experimental_features">
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Experimental Features</h2>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Global Mood Analysis</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Analyze the overall sentiment and mood across all your conversations.
                    </p>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-700 dark:hover:bg-purple-600"
                        onClick={() => alert('Global Mood Analysis is coming soon!')}
                      >
                        Analyze Mood
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FeatureFlag>

          {/* Welcome Section */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to MeshMemory</h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              Start by searching for information or exploring your existing conversations.
            </p>
            <div className="mt-6">
              <Link
                to="/search"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                <Search className="-ml-1 mr-3 h-5 w-5" />
                Search Knowledge Base
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
