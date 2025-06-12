import React from 'react';
import { Layers, Clock, Tag, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tooltip from './Tooltip';

interface ThreadGroupCardProps {
  group: {
    id: string;
    title: string;
    tags: string[];
    memberCount: number;
    updated_at: string;
    summary?: string;
  };
  onMerge: (groupId: string) => void;
  onArchive: (groupId: string) => void;
  onDelete: (groupId: string) => void;
  viewMode?: 'grid' | 'list';
}

export default function ThreadGroupCard({
  group,
  onMerge,
  onArchive,
  onDelete,
  viewMode = 'grid'
}: ThreadGroupCardProps) {
  const getTagColor = (index: number) => {
    const colors = [
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    ];
    return colors[index % colors.length];
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl hover:shadow-lg transition-all duration-200 group">
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
                  {group.title}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {group.memberCount} chat{group.memberCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(group.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-1 max-w-xs">
                {group.tags?.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTagColor(index)}`}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
                {group.tags?.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    +{group.tags.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/threadgroups/${group.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                  Open
                </Link>
                <div className="relative group">
                  <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                    <div className="py-1">
                      <button
                        onClick={() => onMerge(group.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Merge More Chats
                      </button>
                      <button
                        onClick={() => onArchive(group.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Archive Group
                      </button>
                      <button
                        onClick={() => onDelete(group.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Delete Group
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl hover:shadow-lg transition-all duration-200 group">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {group.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {group.memberCount} chat{group.memberCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {/* Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {group.tags?.slice(0, 4).map((tag: string, index: number) => (
              <span
                key={tag}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTagColor(index)}`}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {group.tags?.length > 4 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                +{group.tags.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {group.summary && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {group.summary}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Clock className="h-4 w-4 mr-2" />
          Updated {new Date(group.updated_at).toLocaleDateString()}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/threadgroups/${group.id}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Open Group
          </Link>
          <div className="relative group">
            <Tooltip content="More options">
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </Tooltip>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
              <div className="py-1">
                <button
                  onClick={() => onMerge(group.id)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Merge More Chats
                </button>
                <button
                  onClick={() => onArchive(group.id)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Archive Group
                </button>
                <button
                  onClick={() => onDelete(group.id)}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete Group
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}