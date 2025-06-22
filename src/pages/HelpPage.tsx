import React from 'react';
import { HelpCircle } from 'lucide-react';
import Layout from '../components/Layout';
import HelpPanel from '../components/HelpPanel';

export default function HelpPage() {
  return (
    <Layout title="Help & Documentation">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center">
              <HelpCircle className="h-6 w-6 text-gray-400 dark:text-gray-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Documentation</h1>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Learn how to get the most out of MeshMemory
            </p>
          </div>

          <HelpPanel />
        </div>
      </div>
    </Layout>
  );
}