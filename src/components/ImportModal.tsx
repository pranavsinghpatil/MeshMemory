import React, { useState } from 'react';
import { X, Upload, Link, FileText, Youtube, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateEmbedding } from '../utils/embeddings';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState('chatgpt');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const navigate = useNavigate();

  const tabs = [
    { id: 'chatgpt', name: 'ChatGPT Link', icon: Link },
    { id: 'claude', name: 'Claude Screenshot', icon: Upload },
    { id: 'gemini', name: 'Gemini PDF', icon: FileText },
    { id: 'youtube', name: 'YouTube Link', icon: Youtube },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setProgress('Processing your import...');

    try {
      let sourceData: any = {
        type: activeTab === 'chatgpt' ? 'chatgpt-link' : 
              activeTab === 'youtube' ? 'youtube-link' : 
              activeTab === 'gemini' ? 'pdf' : 'text',
      };

      if (activeTab === 'chatgpt' || activeTab === 'youtube') {
        const url = formData.get('url') as string;
        sourceData.url = url;
        sourceData.title = `${activeTab === 'chatgpt' ? 'ChatGPT' : 'YouTube'} Import`;
      } else if (activeTab === 'claude') {
        const file = formData.get('file') as File;
        sourceData.title = file.name;
      } else if (activeTab === 'gemini') {
        const file = formData.get('file') as File;
        sourceData.title = file.name;
      }

      setProgress('Creating source...');
      const { data: source, error: sourceError } = await supabase
        .from('sources')
        .insert(sourceData)
        .select()
        .single();

      if (sourceError) throw sourceError;

      setProgress('Generating embeddings...');
      
      // For demo purposes, create a sample chunk
      const sampleText = `This is a sample import from ${activeTab}. Content would be extracted and processed here.`;
      const embedding = await generateEmbedding(sampleText);

      setProgress('Saving content...');
      await supabase
        .from('chunks')
        .insert({
          source_id: source.id,
          text_chunk: sampleText,
          embedding,
        });

      setProgress('Complete!');
      
      setTimeout(() => {
        onClose();
        navigate(`/conversations/${source.id}`);
      }, 1000);

    } catch (error) {
      console.error('Import error:', error);
      setProgress('Error occurred during import');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress('');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Import Source</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Ingesting...</p>
                <p className="text-sm text-gray-600">{progress}</p>
              </div>
            ) : (
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
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSubmit(formData);
                }}>
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
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          We'll extract and analyze the video transcript
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Import
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}