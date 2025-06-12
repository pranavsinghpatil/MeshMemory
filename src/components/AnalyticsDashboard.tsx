import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  MessageSquare, 
  Search, 
  Clock, 
  Users, 
  Zap,
  Download,
  Calendar
} from 'lucide-react';

interface AnalyticsDashboardProps {
  userId?: string;
}

export default function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [conversationTrends, setConversationTrends] = useState<any>(null);
  const [searchInsights, setSearchInsights] = useState<any>(null);
  const [modelUsage, setModelUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [userId, selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data
      const [dashboardRes, trendsRes, searchRes, modelRes] = await Promise.all([
        fetch(`/api/analytics/dashboard?user_id=${userId}`),
        fetch(`/api/analytics/conversation-trends?user_id=${userId}&days=${selectedPeriod}`),
        fetch(`/api/analytics/search-insights?user_id=${userId}`),
        fetch(`/api/analytics/model-usage?user_id=${userId}&days=${selectedPeriod}`)
      ]);

      const [dashboard, trends, search, model] = await Promise.all([
        dashboardRes.json(),
        trendsRes.json(),
        searchRes.json(),
        modelRes.json()
      ]);

      setAnalytics(dashboard);
      setConversationTrends(trends);
      setSearchInsights(search);
      setModelUsage(model);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set mock data for demo
      setAnalytics({
        total_sources: 15,
        total_chunks: 342,
        total_threads: 8,
        total_micro_threads: 23,
        avg_chunks_per_source: 22.8,
        most_active_day: 'Tuesday',
        top_participants: ['GPT-4', 'Claude', 'Gemini', 'User'],
        conversation_growth: { last_30_days: 45, last_7_days: 12, today: 3 }
      });
      
      setConversationTrends({
        daily_activity: [
          { date: '2024-01-15', chunks_created: 15, sources_active: 3 },
          { date: '2024-01-14', chunks_created: 22, sources_active: 4 },
          { date: '2024-01-13', chunks_created: 8, sources_active: 2 }
        ],
        source_distribution: [
          { type: 'chatgpt-link', count: 8 },
          { type: 'pdf', count: 4 },
          { type: 'youtube-link', count: 2 },
          { type: 'text', count: 1 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async (format: string) => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          export_type: format,
          user_id: userId,
          date_range: { days: selectedPeriod }
        })
      });
      
      const result = await response.json();
      console.log('Export job created:', result.job_id);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">Insights into your AI conversations</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          
          <button
            onClick={() => exportAnalytics('pdf')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sources</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.total_sources || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Chunks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.total_chunks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Threads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.total_threads || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Micro-threads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.total_micro_threads || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversationTrends?.daily_activity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="chunks_created" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="sources_active" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Source Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Source Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={conversationTrends?.source_distribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, count }) => `${type}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(conversationTrends?.source_distribution || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Usage */}
      {modelUsage?.model_usage && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelUsage.model_usage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model_used" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3B82F6" />
              <Bar dataKey="total_tokens" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Search Insights */}
      {searchInsights?.common_searches && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Search Terms</h3>
          <div className="space-y-3">
            {searchInsights.common_searches.slice(0, 5).map((search: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">{search.query}</span>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{search.frequency} searches</span>
                  <span>{search.avg_results?.toFixed(1)} avg results</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last 30 Days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.conversation_growth?.last_30_days || 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last 7 Days</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.conversation_growth?.last_7_days || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.conversation_growth?.today || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}