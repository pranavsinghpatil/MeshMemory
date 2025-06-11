import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function GuestModeButton() {
  const { continueAsGuest } = useAuth();

  return (
    <button
      onClick={continueAsGuest}
      className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
    >
      Continue as Guest
    </button>
  );
}