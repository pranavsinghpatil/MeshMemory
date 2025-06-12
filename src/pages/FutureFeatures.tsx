import React from 'react';
import Layout from '../components/Layout';
import ComingSoonFeatures from '../components/ComingSoonFeatures';
import FeatureFlag, { ComingSoonBadge } from '../components/FeatureFlag';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

export default function FutureFeatures() {
  const { isEnabled } = useFeatureFlags();

  return (
    <Layout title="Future Features">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Future Features</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Explore upcoming features and experimental capabilities
            </p>
          </div>

          {/* Feature Flags Demo */}
          <div className="mb-12 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Feature Preview
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Some experimental features can be enabled in Settings → Experimental Features
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Global Mood Analysis */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Global Mood Analysis
                  </h3>
                  {isEnabled('globalMood') ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                      Enabled
                    </span>
                  ) : (
                    <ComingSoonBadge feature="Global Mood" />
                  )}
                </div>

                <FeatureFlag flag="globalMood" fallback={
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center h-40">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Enable this feature in Settings to see a mood analysis of your conversations
                    </p>
                  </div>
                }>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
                    <div className="flex justify-between mb-4">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversation Mood</div>
                      <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Positive</div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Negative</span>
                      <span>Neutral</span>
                      <span>Positive</span>
                    </div>
                  </div>
                </FeatureFlag>
              </div>

              {/* Thread Visualization */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Thread Visualization
                  </h3>
                  {isEnabled('threadVisualization') ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                      Enabled
                    </span>
                  ) : (
                    <ComingSoonBadge feature="Thread Visualization" />
                  )}
                </div>

                <FeatureFlag flag="threadVisualization" fallback={
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center h-40">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Enable this feature in Settings to see 3D visualizations of your conversation threads
                    </p>
                  </div>
                }>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-blue-700 dark:text-blue-300 font-medium">Interactive 3D Thread Graph</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Click to explore connections</p>
                    </div>
                  </div>
                </FeatureFlag>
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <ComingSoonFeatures />
        </div>
      </div>
    </Layout>
  );
}