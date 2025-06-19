import React from 'react';
import { Layers, MessageSquare, Clock, TrendingUp, Eye, Calendar, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatCardProps {
  chat: any;
  viewMode: 'grid' | 'list';
  onDelete?: () => void;
}

export default function ChatCard({ chat, viewMode, onDelete }: ChatCardProps) {
  const getTopicColor = (index: number) => {
    const colors = [
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    ];
    return colors[index % colors.length];
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {chat.title}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {chat.chunkCount} message{chat.chunkCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {chat.topics?.slice(0, 2).map((topic: string, index: number) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTopicColor(index)}`}
                  >
                    {topic}
                  </span>
                ))}
                {chat.topics?.length > 2 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    +{chat.topics.length - 2} more
                  </span>
                )}
              </div>
            </div>
            <Link
              to={`/chats/${chat.id}`}
              className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full group">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
              {chat.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
              {chat.summary || 'No summary available'}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {chat.topics?.slice(0, 3).map((topic: string, index: number) => (
            <span
              key={index}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTopicColor(index)}`}
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            <span>{chat.chunkCount || 0} messages</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>{new Date(chat.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
        <Link
          to={`/chats/${chat.id}`}
          className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
