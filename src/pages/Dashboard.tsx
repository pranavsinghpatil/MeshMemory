import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, TrendingUp, Users, Beaker, MessageCircle } from 'lucide-react';
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
    } finally {
      setLoading(false);
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
              Start your intelligent AI conversation journey with knitter.app
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
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>

    setLoading(false);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    setError('Failed to load dashboard data');
    setLoading(false);
  } finally {
    setLoading(false);
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
            Start your intelligent AI conversation journey with knitter.app
          </p>
          {isGuest && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You're in guest mode with limited features. Sign up for full access to import sources and create threads.
                {loading ? (
                  <SkeletonLoader type="list" />
                ) : (
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
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
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Chats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Chats</h2>
                <Link to="/chats" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <SkeletonLoader type="list" />
                ) : recentChats.length > 0 ? (
                  recentChats.map((chat) => (
                    <Link key={chat.id} to={`/chats/${chat.id}`} className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{chat.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(chat.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent chats</p>
                )}
              </div>
            </div>
          </div>

          {/* Experimental Feature Preview */}
          <FeatureFlag flag="globalMood">
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Beaker className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Global Mood Analysis (Experimental)
                </h3>
              </div>
              
              <div className="bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Sentiment</span>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Positive</span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Negative</span>
                  <span>Neutral</span>
                  <span>Positive</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                This experimental feature analyzes the emotional tone across all your AI conversations.
                Disable it in Settings → Experimental Features if you don't need it.
              </p>
              
              <Link to="/settings" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
                Manage experimental features →
              </Link>
            </div>
          </FeatureFlag>

          {/* Welcome Section */}
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <div className="px-6 py-8 sm:px-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Welcome to knitter.app
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
                    to="/future-features"
                    className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    Explore Future Features
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
