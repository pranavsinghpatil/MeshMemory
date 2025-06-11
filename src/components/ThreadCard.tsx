import React from 'react';
import { Layers, MessageSquare, Clock, TrendingUp, Eye, Calendar, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ThreadCardProps {
  thread: any;
  viewMode: 'grid' | 'list';
}

export default function ThreadCard({ thread, viewMode }: ThreadCardProps) {
  const getTopicColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[index % colors.length];
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white shadow-md rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                  {thread.title}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {thread.chunkCount} message{thread.chunkCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(thread.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Topics */}
              <div className="flex flex-wrap gap-1 max-w-xs">
                {thread.topics?.slice(0, 3).map((topic: string, index: number) => (
                  <span
                    key={topic}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTopicColor(index)}`}
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {topic}
                  </span>
                ))}
              </div>

              <Link
                to={`/threads/${thread.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Thread
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-2xl hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {thread.title}
            </h3>
            <p className="text-sm text-gray-500">
              {thread.chunkCount} message{thread.chunkCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {/* Topics/Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {thread.topics?.slice(0, 4).map((topic: string, index: number) => (
              <span
                key={topic}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTopicColor(index)}`}
              >
                <Hash className="h-3 w-3 mr-1" />
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
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

        {/* Action Button */}
        <Link
          to={`/threads/${thread.id}`}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Thread
        </Link>
      </div>
    </div>
  );
}