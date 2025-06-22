import React from 'react';
import ComingSoonFeatures from '../components/ComingSoonFeatures';
import FeatureFlag, { ComingSoonBadge } from '../components/FeatureFlag';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import Layout from '../components/Layout';

export default function FutureFeatures() {
  const { isEnabled } = useFeatureFlags();

  return (
    <Layout title="Future Features">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#3B3B1A] dark:text-[#EAEFEF]">Future Features</h1>
            <p className="mt-2 text-lg text-[#8A784E] dark:text-[#B8CFCE]">
              Explore upcoming features and experimental capabilities for MeshMemory
            </p>
          </div>

          {/* Feature Flags Demo */}
          <div className="mb-12 bg-white dark:bg-[#333446] shadow-md rounded-lg p-6 border border-[#AEC8A4]/30 dark:border-[#7F8CAA]/30">
            <h2 className="text-xl font-semibold text-[#3B3B1A] dark:text-[#EAEFEF] mb-4">
              Feature Preview
            </h2>
            <p className="text-[#8A784E] dark:text-[#B8CFCE] mb-6">
              Some experimental features can be enabled in Settings → Experimental Features
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Global Mood Analysis */}
              <div className="border border-[#AEC8A4]/30 dark:border-[#7F8CAA]/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-[#3B3B1A] dark:text-[#EAEFEF]">
                    Global Mood Analysis
                  </h3>
                  {isEnabled('globalMood') ? (
                    <span className="px-2 py-1 text-xs font-medium bg-[#E7EFC7] dark:bg-[#333446] text-[#3B3B1A] dark:text-[#EAEFEF] rounded-full">
                      Enabled
                    </span>
                  ) : (
                    <ComingSoonBadge feature="Global Mood" />
                  )}
                </div>

                <FeatureFlag flag="globalMood" fallback={
                  <div className="bg-[#E7EFC7]/20 dark:bg-[#333446]/70 rounded-lg p-4 flex items-center justify-center h-40">
                    <p className="text-[#8A784E] dark:text-[#B8CFCE] text-center">
                      Enable this feature in Settings to see a mood analysis of your conversations
                    </p>
                  </div>
                }>
                  <div className="bg-gradient-to-r from-[#E7EFC7]/20 to-[#AEC8A4]/20 dark:from-[#333446]/70 dark:to-[#7F8CAA]/50 rounded-lg p-4">
                    <div className="flex justify-between mb-4">
                      <div className="text-sm font-medium text-[#3B3B1A] dark:text-[#B8CFCE]">Conversation Mood</div>
                      <div className="text-sm font-medium text-[#8A784E] dark:text-[#EAEFEF]">Positive</div>
                    </div>
                    <div className="h-4 bg-[#E7EFC7]/30 dark:bg-[#333446]/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#AEC8A4] to-[#8A784E] dark:from-[#7F8CAA] dark:to-[#B8CFCE]" style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-[#8A784E] dark:text-[#B8CFCE]">
                      <span>Negative</span>
                      <span>Neutral</span>
                      <span>Positive</span>
                    </div>
                  </div>
                </FeatureFlag>
              </div>

              {/* Thread Visualization */}
              <div className="border border-[#AEC8A4]/30 dark:border-[#7F8CAA]/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-[#3B3B1A] dark:text-[#EAEFEF]">
                    Thread Visualization
                  </h3>
                  {isEnabled('threadVisualization') ? (
                    <span className="px-2 py-1 text-xs font-medium bg-[#E7EFC7] dark:bg-[#333446] text-[#3B3B1A] dark:text-[#EAEFEF] rounded-full">
                      Enabled
                    </span>
                  ) : (
                    <ComingSoonBadge feature="Thread Visualization" />
                  )}
                </div>

                <FeatureFlag flag="threadVisualization" fallback={
                  <div className="bg-[#E7EFC7]/20 dark:bg-[#333446]/70 rounded-lg p-4 flex items-center justify-center h-40">
                    <p className="text-[#8A784E] dark:text-[#B8CFCE] text-center">
                      Enable this feature in Settings to see 3D visualizations of your conversation threads
                    </p>
                  </div>
                }>
                  <div className="bg-gradient-to-r from-[#E7EFC7]/20 to-[#AEC8A4]/20 dark:from-[#333446]/70 dark:to-[#7F8CAA]/50 rounded-lg p-4 h-40 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-[#3B3B1A] dark:text-[#EAEFEF] font-medium">Interactive 3D Thread Graph</p>
                      <p className="text-sm text-[#8A784E] dark:text-[#B8CFCE] mt-2">Click to explore connections</p>
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
