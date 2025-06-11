import React, { useState } from 'react';
import { Upload, Link, FileText, Youtube, Loader2 } from 'lucide-react';

interface ImportFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  progress: string;
}

export default function ImportForm({ onSubmit, loading, progress }: ImportFormProps) {
  const [activeTab, setActiveTab] = useState('chatgpt');

  const tabs = [
    { id: 'chatgpt', name: 'ChatGPT Link', icon: Link },
    { id: 'claude', name: 'Claude Screenshot', icon: Upload },
    { id: 'gemini', name: 'Gemini PDF', icon: FileText },
    { id: 'youtube', name: 'YouTube Link', icon: Youtube },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('type', activeTab);
    await onSubmit(formData);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">Ingesting...</p>
        <p className="text-sm text-gray-600">{progress}</p>
      </div>
    );
  }

  return (
    <>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit}>
        {activeTab === 'chatgpt' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ChatGPT Share Link
              </label>
              <input
                type="url"
                name="url"
                placeholder="https://chat.openai.com/share/..."
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Paste the share link from your ChatGPT conversation
              </p>
            </div>
          </div>
        )}

        {activeTab === 'claude' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claude Screenshot
              </label>
              <input
                type="file"
                name="file"
                accept="image/*"
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload a screenshot of your Claude conversation
              </p>
            </div>
          </div>
        )}

        {activeTab === 'gemini' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gemini PDF Export
              </label>
              <input
                type="file"
                name="file"
                accept=".pdf"
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload a PDF export from your Gemini conversation
              </p>
            </div>
          </div>
        )}

        {activeTab === 'youtube' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video Link
              </label>
              <input
                type="url"
                name="url"
                placeholder="https://www.youtube.com/watch?v=..."
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                We'll extract and analyze the video transcript
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Import
          </button>
        </div>
      </form>
    </>
  );
}