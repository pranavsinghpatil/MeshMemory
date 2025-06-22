import React, { useState } from 'react';
import { Key, Shield, Bell, User, Database, Settings } from 'lucide-react';
import SettingsPanel from '../components/SettingsPanel';
import APIKeyForm from '../components/APIKeyForm';

// Uncomment the next line if useAuth is implemented and needed
// import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  // Uncomment the next line if useAuth is implemented and needed
  // const { isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState('api-keys');

  const tabs = [
    { id: 'api-keys', name: 'API Keys', icon: Key },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data Management', icon: Database },
  ];

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
          </div>

          <SettingsPanel 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-500 dark:border-indigo-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <tab.icon className={`mr-3 h-5 w-5 ${
                        activeTab === tab.id
                          ? 'text-indigo-500 dark:text-indigo-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {activeTab === 'api-keys' && <APIKeyForm />}
              {activeTab === 'security' && (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Security settings are only available for registered users.
                  </p>
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Profile settings are only available for registered users.
                  </p>
                </div>
              )}
              {activeTab === 'notifications' && (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Notification settings are only available for registered users.
                  </p>
                </div>
              )}
              {activeTab === 'data' && (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Data management options are only available for registered users.
                  </p>
                </div>
              )}
            </div>
          </div>
 
        </div>
      </div>
  );
}
