import React from 'react';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'list' | 'search' | 'conversation' | 'thread';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  type = 'text', 
  count = 1, 
  className = '' 
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        );

      case 'card':
        return (
          <div className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'search':
        return (
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'conversation':
        return (
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs sm:max-w-md p-4 rounded-2xl ${
                  i % 2 === 0 
                    ? 'bg-gray-200 dark:bg-gray-700' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'thread':
        return (
          <div className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
          </div>
        );

      default:
        return (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={count > 1 ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}