import React from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

export default function AnalyticsPage() {
  const { user, isGuest } = useAuth();

  return (
    <Layout title="Analytics">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {isGuest ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-xl bg-[#E7EFC7] dark:bg-[#333446] flex items-center justify-center mb-6">
                <span className="text-[#8A784E] dark:text-[#B8CFCE] font-bold text-xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-[#3B3B1A] dark:text-[#EAEFEF] mb-4">
                MeshMemory Analytics
              </h2>
              <p className="text-[#8A784E] dark:text-[#B8CFCE] mb-6">
                Sign up to access detailed analytics about your AI conversations
              </p>
              <button className="inline-flex items-center px-6 py-3 border border-[#AEC8A4] dark:border-[#7F8CAA] text-base font-medium rounded-md text-[#3B3B1A] dark:text-[#EAEFEF] bg-[#AEC8A4] hover:bg-[#E7EFC7] dark:bg-[#7F8CAA] dark:hover:bg-[#333446] transition-colors">
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
