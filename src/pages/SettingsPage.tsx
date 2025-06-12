import React, { useState } from 'react';
<<<<<<< HEAD
import { Settings } from 'lucide-react';
import Layout from '../components/Layout';
import SettingsPanel from '../components/SettingsPanel';
=======
import { Settings, Key, Shield, Bell, User, Database } from 'lucide-react';
import Layout from '../components/Layout';
import APIKeyForm from '../components/APIKeyForm';
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api-keys');
  const { isGuest } = useAuth();
<<<<<<< HEAD
=======
  
  const tabs = [
    { id: 'api-keys', name: 'API Keys', icon: Key },
    { id: 'account', name: 'Account', icon: User },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data Management', icon: Database },
  ];
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396

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

<<<<<<< HEAD
          <SettingsPanel 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
=======
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const isDisabled = isGuest && tab.id !== 'api-keys';
                    return (
                      <button
                        key={tab.id}
                        onClick={() => !isDisabled && setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                          activeTab === tab.id
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-500 dark:border-indigo-400'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isDisabled}
                      >
                        <tab.icon className={`mr-3 h-5 w-5 ${
                          activeTab === tab.id
                            ? 'text-indigo-500 dark:text-indigo-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`} />
                        <span>{tab.name}</span>
                        {isDisabled && (
                          <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                            Pro
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {activeTab === 'api-keys' && <APIKeyForm />}
              
              {activeTab === 'account' && (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Account settings are only available for registered users.
                  </p>
                </div>
              )}
              
              {activeTab === 'privacy' && (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Privacy Settings</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Privacy settings are only available for registered users.
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
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
        </div>
      </div>
    </Layout>
  );
}