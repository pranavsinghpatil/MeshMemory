import React, { useState } from 'react';
import { 
  User, 
  Key, 
  Shield, 
  Bell, 
  Database, 
  Sliders, 
  Moon, 
  Sun, 
  Monitor,
  Save,
  Loader2,
  Building,
  Users
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import APIKeyForm from './APIKeyForm';
import StitchSensitivitySlider from './StitchSensitivitySlider';
import FeatureFlagsPanel from './FeatureFlagsPanel';

interface SettingsPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function SettingsPanel({ activeTab, onTabChange }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const [benchmarkSettings, setBenchmarkSettings] = useState({
    autoCreateBenchmarks: true,
    benchmarkInterval: 10,
    summarizeAtBenchmarks: true
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    digestFrequency: 'daily'
  });
  const [privacySettings, setPrivacySettings] = useState({
    defaultVisibility: 'private',
    allowAnonymousSharing: false,
    dataRetentionPeriod: '1year'
  });
  const [saving, setSaving] = useState(false);
  const [stitchSensitivity, setStitchSensitivity] = useState(0.7);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'api-keys', name: 'API Keys', icon: Key },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'data', name: 'Data Management', icon: Database },
    { id: 'preferences', name: 'Preferences', icon: Sliders },
    { id: 'team', name: 'Team Settings', icon: Users, premium: true }
  ];

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would save to the backend
    console.log('Saving settings:', {
      benchmarkSettings,
      notificationSettings,
      privacySettings,
      stitchSensitivity
    });
    
    setSaving(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            } ${tab.premium ? 'relative' : ''}`}
          >
            <div className="flex items-center">
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
              {tab.premium && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-sm">
                  PRO
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  Change Avatar
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timezone
                </label>
                <select
                  defaultValue="America/New_York"
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <APIKeyForm />
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Visibility for New Content
                </label>
                <select
                  value={privacySettings.defaultVisibility}
                  onChange={(e) => setPrivacySettings({...privacySettings, defaultVisibility: e.target.value})}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="private">Private (Only you)</option>
                  <option value="team">Team (Your workspace members)</option>
                  <option value="shared">Shared (Anyone with the link)</option>
                  <option value="public">Public (Anyone)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="allow-anonymous"
                  type="checkbox"
                  checked={privacySettings.allowAnonymousSharing}
                  onChange={(e) => setPrivacySettings({...privacySettings, allowAnonymousSharing: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="allow-anonymous" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Allow anonymous sharing of conversations
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Retention Period
                </label>
                <select
                  value={privacySettings.dataRetentionPeriod}
                  onChange={(e) => setPrivacySettings({...privacySettings, dataRetentionPeriod: e.target.value})}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="forever">Keep Forever</option>
                  <option value="1year">1 Year</option>
                  <option value="6months">6 Months</option>
                  <option value="3months">3 Months</option>
                  <option value="1month">1 Month</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Export & Deletion</h3>
                <div className="flex space-x-3">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Export All Data
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="email-notifications"
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Email Notifications
                  </label>
                </div>
                {notificationSettings.emailNotifications && (
                  <select
                    value={notificationSettings.digestFrequency}
                    onChange={(e) => setNotificationSettings({...notificationSettings, digestFrequency: e.target.value})}
                    className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  id="in-app-notifications"
                  type="checkbox"
                  checked={notificationSettings.inAppNotifications}
                  onChange={(e) => setNotificationSettings({...notificationSettings, inAppNotifications: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="in-app-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  In-App Notifications
                </label>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Types</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="notify-thread-updates"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notify-thread-updates" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Thread Group Updates
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="notify-shared"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notify-shared" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Shared Content Access
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="notify-benchmarks"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notify-benchmarks" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Benchmark Summaries
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>
            
            <div className="space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">Storage Usage</h3>
                <div className="flex items-center">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 dark:bg-indigo-500" style={{ width: '35%' }}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-indigo-700 dark:text-indigo-300">35%</span>
                </div>
                <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
                  Using 350MB of 1GB storage (Free Plan)
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Export as JSON
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Export as Markdown
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Export as PDF
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Export to IPFS
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Cleanup</h3>
                <div className="space-y-3">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Archive Old Conversations
                  </button>
                  <button className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                    Delete All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
            
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg ${
                      theme === 'light' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } transition-colors`}
                  >
                    <Sun className={`h-6 w-6 ${theme === 'light' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className={`text-sm ${theme === 'light' ? 'font-medium text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>Light</span>
                  </button>
                  
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } transition-colors`}
                  >
                    <Moon className={`h-6 w-6 ${theme === 'dark' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className={`text-sm ${theme === 'dark' ? 'font-medium text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>Dark</span>
                  </button>
                  
                  <button
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg ${
                      theme === 'system' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } transition-colors`}
                  >
                    <Monitor className={`h-6 w-6 ${theme === 'system' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className={`text-sm ${theme === 'system' ? 'font-medium text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>System</span>
                  </button>
                </div>
              </div>
              
              {/* Stitch Sensitivity */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <StitchSensitivitySlider 
                  value={stitchSensitivity} 
                  onChange={setStitchSensitivity} 
                />
              </div>
              
              {/* Benchmark Settings */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Benchmark Settings</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="auto-benchmarks"
                        type="checkbox"
                        checked={benchmarkSettings.autoCreateBenchmarks}
                        onChange={(e) => setBenchmarkSettings({...benchmarkSettings, autoCreateBenchmarks: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="auto-benchmarks" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Auto-create benchmarks
                      </label>
                    </div>
                    {benchmarkSettings.autoCreateBenchmarks && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Every</span>
                        <select
                          value={benchmarkSettings.benchmarkInterval}
                          onChange={(e) => setBenchmarkSettings({...benchmarkSettings, benchmarkInterval: parseInt(e.target.value)})}
                          className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="15">15</option>
                          <option value="20">20</option>
                        </select>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">messages</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="summarize-benchmarks"
                      type="checkbox"
                      checked={benchmarkSettings.summarizeAtBenchmarks}
                      onChange={(e) => setBenchmarkSettings({...benchmarkSettings, summarizeAtBenchmarks: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="summarize-benchmarks" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Auto-summarize at benchmarks
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Settings</h2>
            
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Building className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Premium Feature</h3>
                  <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-200">
                    Team workspaces allow you to collaborate with your team members on shared conversations and thread groups.
                  </p>
                  <button className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 opacity-50 pointer-events-none">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Workspaces</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                          <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Personal Workspace</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Your private workspace
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                          <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Acme Corp</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            5 members • 12 thread groups
                          </p>
                        </div>
                      </div>
                      <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        Switch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team Members</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">JD</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">John Doe (You)</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            john.doe@example.com
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                        Admin
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-pink-600 dark:text-pink-400">JS</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Jane Smith</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            jane.smith@example.com
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        Member
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  + Invite Team Member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}