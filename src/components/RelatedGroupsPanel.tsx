import React from 'react';
import { Link, Layers, ArrowRight } from 'lucide-react';
import Tooltip from './Tooltip';

interface RelatedGroupsProps {
  relatedGroups: any[];
}

export default function RelatedGroupsPanel({ relatedGroups }: RelatedGroupsProps) {
  if (!relatedGroups || relatedGroups.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Related Groups</h3>
        <div className="text-center py-6">
          <Link className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No related thread groups found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Related Groups</h3>
      <div className="space-y-3">
        {relatedGroups.map(group => (
          <div 
            key={group.id} 
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                  <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{group.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {group.memberCount} chats • {group.tags.slice(0, 2).join(', ')}
                    {group.tags.length > 2 && '...'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Tooltip content="View group">
                  <a 
                    href={`/threadgroups/${group.id}`}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Tooltip>
              </div>
            </div>
            {group.similarity && (
              <div className="mt-2 flex items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Similarity:</div>
                <div className="ml-2 flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full" 
                    style={{ width: `${Math.round(group.similarity * 100)}%` }}
                  ></div>
                </div>
                <div className="ml-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {Math.round(group.similarity * 100)}%
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}