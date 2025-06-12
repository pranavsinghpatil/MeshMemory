import React, { useState } from 'react';
import { X, Upload, Link, FileText, Youtube, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { importAPI } from '../lib/api';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState('chatgpt');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    assignToGroup: ''
  });
  const [availableGroups, setAvailableGroups] = useState<any[]>([
    { id: 'group-1', title: 'React State Management' },
    { id: 'group-2', title: 'Machine Learning Fundamentals' },
    { id: 'group-3', title: 'Database Design Patterns' }
  ]);
  
  const navigate = useNavigate();

  const tabs = [
    { id: 'chatgpt', name: 'ChatGPT Link', icon: Link },
    { id: 'claude', name: 'Claude Screenshot', icon: Upload },
    { id: 'gemini', name: 'Gemini PDF', icon: FileText },
    { id: 'youtube', name: 'YouTube Link', icon: Youtube },
  ];

  if (!isOpen) return null;

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    data.append('type', activeTab);
    setFormData(data);
    
    // In a real implementation, we would send the data to the server for preview
    // For now, we'll simulate a preview
    setLoading(true);
    setProgress('Processing your import for preview...');
    
    setTimeout(() => {
      // Generate mock preview data based on the import type
      let preview;
      const url = data.get('url') as string;
      const file = data.get('file') as File;
      
      if (activeTab === 'chatgpt') {
        preview = {
          title: 'ChatGPT Conversation',
          type: 'chatgpt-link',
          url,
          chunkCount: 12,
          participants: ['User', 'ChatGPT'],
          preview: [
            { role: 'user', content: 'What are the best practices for React state management?' },
            { role: 'assistant', content: 'React state management best practices include...' }
          ]
        };
      } else if (activeTab === 'claude') {
        preview = {
          title: file?.name.replace(/\.[^/.]+$/, '') || 'Claude Conversation',
          type: 'claude-screenshot',
          chunkCount: 8,
          participants: ['Human', 'Claude'],
          preview: [
            { role: 'user', content: 'Can you explain the concept of embeddings in AI?' },
            { role: 'assistant', content: 'Embeddings in AI are vector representations...' }
          ]
        };
      } else if (activeTab === 'gemini') {
        preview = {
          title: file?.name.replace(/\.[^/.]+$/, '') || 'Gemini Conversation',
          type: 'gemini-pdf',
          chunkCount: 15,
          participants: ['User', 'Gemini'],
          preview: [
            { role: 'user', content: 'How do large language models work?' },
            { role: 'assistant', content: 'Large language models are based on transformer architectures...' }
          ]
        };
      } else if (activeTab === 'youtube') {
        preview = {
          title: 'YouTube Transcript',
          type: 'youtube-link',
          url,
          chunkCount: 20,
          participants: ['Speaker'],
          preview: [
            { role: 'speaker', content: 'In this video, we\'ll be discussing...' }
          ]
        };
      }
      
      setPreviewData(preview);
      setMetadata(prev => ({
        ...prev,
        title: preview?.title || ''
      }));
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleStepTwoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleStepThreeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, we would send the final data to the server
    setLoading(true);
    setProgress('Processing your import...');
    
    setTimeout(() => {
      setProgress('Generating embeddings...');
      setTimeout(() => {
        setProgress('Finalizing import...');
        setTimeout(() => {
          setProgress('Complete!');
          setTimeout(() => {
            onClose();
            // Navigate to the appropriate page based on the import type
            if (metadata.assignToGroup) {
              navigate(`/threadgroups/${metadata.assignToGroup}`);
            } else {
              // Navigate to the conversation view for the new import
              navigate(`/conversations/new-import-id`);
            }
          }, 1000);
        }, 500);
      }, 1000);
    }, 1000);
  };

  const renderStepOne = () => (
    <>
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
      <form onSubmit={handleStepOneSubmit}>
        {activeTab === 'chatgpt' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ChatGPT Share Link
              </label>
              <input
                type="url"
                name="url"
                placeholder="https://chat.openai.com/share/..."
                required
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Paste the share link from your ChatGPT conversation
              </p>
            </div>
          </div>
        )}

        {activeTab === 'claude' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Claude Screenshot
              </label>
              <input
                type="file"
                name="file"
                accept="image/*"
                required
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload a screenshot of your Claude conversation
              </p>
            </div>
          </div>
        )}

        {activeTab === 'gemini' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gemini PDF Export
              </label>
              <input
                type="file"
                name="file"
                accept=".pdf"
                required
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload a PDF export from your Gemini conversation
              </p>
            </div>
          </div>
        )}

        {activeTab === 'youtube' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                YouTube Video Link
              </label>
              <input
                type="url"
                name="url"
                placeholder="https://www.youtube.com/watch?v=..."
                required
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                We'll extract and analyze the video transcript
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </form>
    </>
  );

  const renderStepTwo = () => (
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preview & Metadata</h3>
      
      <form onSubmit={handleStepTwoSubmit}>
        <div className="space-y-6">
          {/* Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content Preview</h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
              {previewData?.preview.map((item: any, index: number) => (
                <div key={index} className="mb-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {item.role === 'user' || item.role === 'human' ? 'You' : item.role}:
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200">
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {previewData?.chunkCount} chunks detected • {previewData?.participants.join(', ')}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Title
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter a title for this source"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={metadata.date}
                onChange={(e) => setMetadata({...metadata, date: e.target.value})}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </form>
    </>
  );

  const renderStepThree = () => (
    <>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assign to Thread Group</h3>
      
      <form onSubmit={handleStepThreeSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thread Group (Optional)
            </label>
            <select
              value={metadata.assignToGroup}
              onChange={(e) => setMetadata({...metadata, assignToGroup: e.target.value})}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Leave Ungrouped</option>
              {availableGroups.map(group => (
                <option key={group.id} value={group.id}>{group.title}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You can assign this conversation to an existing thread group or leave it ungrouped
            </p>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">Import Summary</h4>
            <ul className="space-y-2 text-sm text-indigo-700 dark:text-indigo-200">
              <li><span className="font-medium">Source Type:</span> {previewData?.type}</li>
              <li><span className="font-medium">Title:</span> {metadata.title}</li>
              <li><span className="font-medium">Chunks:</span> {previewData?.chunkCount}</li>
              <li><span className="font-medium">Date:</span> {new Date(metadata.date).toLocaleDateString()}</li>
              <li><span className="font-medium">Thread Group:</span> {metadata.assignToGroup ? availableGroups.find(g => g.id === metadata.assignToGroup)?.title : 'Ungrouped'}</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Import
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Import Source {step > 1 && `- Step ${step} of 3`}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Processing Import...</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{progress}</p>
              </div>
            ) : (
              <>
                {step === 1 && renderStepOne()}
                {step === 2 && renderStepTwo()}
                {step === 3 && renderStepThree()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}