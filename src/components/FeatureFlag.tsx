import React from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

interface FeatureFlagProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const { isEnabled } = useFeatureFlags();
  
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
}

export function ComingSoonBadge({ feature }: { feature: string }) {
  return (
    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></span>
      Coming Soon
    </div>
  );
}