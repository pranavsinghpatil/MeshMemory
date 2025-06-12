import React from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { Beaker, Info } from 'lucide-react';
import Tooltip from './Tooltip';

export default function FeatureFlagsPanel() {
  const { flags, toggleFlag } = useFeatureFlags();

  const featureDescriptions: Record<string, string> = {
    globalMood: 'AI-powered sentiment analysis across all your conversations to track emotional patterns and insights.',
    threadVisualization: 'Interactive 3D graph showing relationships between conversation threads and topics.',
    advancedAnalytics: 'Deep insights into your learning patterns, knowledge gaps, and conversation effectiveness.',
    aiAssistant: 'Proactive AI assistant that suggests relevant information based on your current context.',
    collaborativeThreads: 'Share and collaborate on conversation threads with team members in real-time.',
    voiceNotes: 'Record voice notes and automatically transcribe them into searchable conversation chunks.',
    smartSuggestions: 'AI-powered suggestions for follow-up questions and related topics based on your conversation history.'
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Beaker className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Experimental Features</h2>
      </div>

      <div className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          These features are experimental and may not be fully functional. Enable them at your own risk.
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(flags).map(([key, enabled]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <Tooltip content={featureDescriptions[key] || 'No description available'}>
                <Info className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-help" />
              </Tooltip>
            </div>
            
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={enabled}
                onChange={() => toggleFlag(key as keyof typeof flags)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            localStorage.removeItem('featureFlags');
            window.location.reload();
          }}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
        >
          Reset All Features
        </button>
      </div>
    </div>
  );
}