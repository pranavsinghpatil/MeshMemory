import { useState, useEffect } from 'react';

interface FeatureFlags {
  globalMood: boolean;
  threadVisualization: boolean;
  advancedAnalytics: boolean;
  aiAssistant: boolean;
  collaborativeThreads: boolean;
  voiceNotes: boolean;
  smartSuggestions: boolean;
}

const defaultFlags: FeatureFlags = {
  globalMood: false,
  threadVisualization: false,
  advancedAnalytics: false,
  aiAssistant: false,
  collaborativeThreads: false,
  voiceNotes: false,
  smartSuggestions: false,
};

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  useEffect(() => {
    // Load feature flags from localStorage or environment
    const savedFlags = localStorage.getItem('featureFlags');
    if (savedFlags) {
      try {
        const parsedFlags = JSON.parse(savedFlags);
        setFlags({ ...defaultFlags, ...parsedFlags });
      } catch (error) {
        console.error('Error parsing feature flags:', error);
      }
    }

    // Override with environment variables in development
    if (import.meta.env.DEV) {
      const envFlags: Partial<FeatureFlags> = {};
      
      if (import.meta.env.VITE_FEATURE_GLOBAL_MOOD === 'true') {
        envFlags.globalMood = true;
      }
      if (import.meta.env.VITE_FEATURE_THREAD_VIZ === 'true') {
        envFlags.threadVisualization = true;
      }
      if (import.meta.env.VITE_FEATURE_ADVANCED_ANALYTICS === 'true') {
        envFlags.advancedAnalytics = true;
      }
      
      setFlags(prev => ({ ...prev, ...envFlags }));
    }
  }, []);

  const isEnabled = (flag: keyof FeatureFlags): boolean => {
    return flags[flag] || false;
  };

  const toggleFlag = (flag: keyof FeatureFlags) => {
    const newFlags = { ...flags, [flag]: !flags[flag] };
    setFlags(newFlags);
    localStorage.setItem('featureFlags', JSON.stringify(newFlags));
  };

  const enableFlag = (flag: keyof FeatureFlags) => {
    const newFlags = { ...flags, [flag]: true };
    setFlags(newFlags);
    localStorage.setItem('featureFlags', JSON.stringify(newFlags));
  };

  const disableFlag = (flag: keyof FeatureFlags) => {
    const newFlags = { ...flags, [flag]: false };
    setFlags(newFlags);
    localStorage.setItem('featureFlags', JSON.stringify(newFlags));
  };

  return {
    flags,
    isEnabled,
    toggleFlag,
    enableFlag,
    disableFlag,
  };
}