import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import Layout from '../components/Layout';
import SettingsPanel from '../components/SettingsPanel';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api-keys');
  const { isGuest } = useAuth();

  return (
    <Layout title="Settings">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-gray-400 dark:text-gray-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Manage your account settings and preferences
            </p>
            
            {isGuest && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You're in guest mode with limited features. Sign up for full access to settings and API key management.
                </p>
              </div>
            )}
          </div>

          <SettingsPanel 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </Layout>
  );
}