import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  showHomeLink?: boolean;
  className?: string;
}

export default function ErrorMessage({
  title,
  message,
  type = 'error',
  onRetry,
  showHomeLink = false,
  className = ''
}: ErrorMessageProps) {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-400 dark:text-yellow-500',
          title: 'text-yellow-800 dark:text-yellow-300',
          message: 'text-yellow-700 dark:text-yellow-400'
        };
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-400 dark:text-blue-500',
          title: 'text-blue-800 dark:text-blue-300',
          message: 'text-blue-700 dark:text-blue-400'
        };
      default:
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: 'text-red-400 dark:text-red-500',
          title: 'text-red-800 dark:text-red-300',
          message: 'text-red-700 dark:text-red-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className={`h-5 w-5 ${styles.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`text-sm ${styles.message}`}>
            {message}
          </p>
          
          {(onRetry || showHomeLink) && (
            <div className="mt-4 flex space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                    type === 'error' 
                      ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/50 hover:bg-red-200 dark:hover:bg-red-800' 
                      : type === 'warning'
                      ? 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/50 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                      : 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-800'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    type === 'error' 
                      ? 'focus:ring-red-500' 
                      : type === 'warning'
                      ? 'focus:ring-yellow-500'
                      : 'focus:ring-blue-500'
                  } transition-colors`}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
              )}
              
              {showHomeLink && (
                <Link
                  to="/"
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                    type === 'error' 
                      ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/50 hover:bg-red-200 dark:hover:bg-red-800' 
                      : type === 'warning'
                      ? 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/50 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                      : 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-800'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    type === 'error' 
                      ? 'focus:ring-red-500' 
                      : type === 'warning'
                      ? 'focus:ring-yellow-500'
                      : 'focus:ring-blue-500'
                  } transition-colors`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}