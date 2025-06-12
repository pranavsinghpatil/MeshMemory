import React from 'react';
import Layout from '../components/Layout';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useAuth } from '../contexts/AuthContext';

export default function AnalyticsPage() {
  const { user, isGuest } = useAuth();

  return (
    <Layout title="Analytics">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {isGuest ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Analytics Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sign up to access detailed analytics about your AI conversations
              </p>
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Sign Up for Analytics
              </button>
            </div>
          ) : (
            <AnalyticsDashboard userId={user?.id} />
          )}
        </div>
      </div>
    </Layout>
  );
}