import React, { useState } from 'react';
import { X, Send, Loader2, MessageSquare, Plus, Copy, Share, Info } from 'lucide-react';
import { microThreadsAPI } from '../lib/api';
import Tooltip from './Tooltip';

interface MicroThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  chunk: any;
  onMicroThreadCreated?: () => void;
}

export default function MicroThreadModal({ 
  isOpen, 
  onClose, 
  chunk, 
  onMicroThreadCreated 
}: MicroThreadModalProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [modelUsed, setModelUsed] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !chunk) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await microThreadsAPI.createMicroThread(
        chunk.id,
        question
      );

      setResponse(result.answer);
      setModelUsed(result.modelUsed);

      onMicroThreadCreated?.();
    } catch (error) {
      console.error('Error creating micro-thread:', error);
      setError('Failed to create follow-up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMainThread = async () => {
    // This would add the micro-thread to the main conversation thread
    // Implementation depends on your threading logic
    console.log('Adding to main thread...');
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const shareContent = () => {
    if (!response) return;
    
    const text = `Q: ${question}\n\nA: ${response}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'MeshMemory Follow-up',
        text: text
      }).catch(err => {
        console.error('Error sharing:', err);
        copyToClipboard(text);
      });
    } else {
      copyToClipboard(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Follow-up Question</h3>
                <Tooltip 
                  content="Ask a follow-up question about this specific part of the conversation. The AI will answer based on this context."
                >
                  <Info className="h-4 w-4 ml-2 text-gray-400 dark:text-gray-500 cursor-help" />
                </Tooltip>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{chunk.content}</p>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="w-full p-3 pr-12 bg-white dark:bg-gray-900 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white resize-none h-24"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!question.trim() || loading}
                  className="absolute right-2 bottom-2 p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Tooltip content="Send question">
                      <Send className="h-4 w-4" />
                    </Tooltip>
                  )}
                </button>
              </div>
            </form>
            
            {response && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                      Response {modelUsed ? `(${modelUsed})` : ''}
                    </h4>
                  </div>
                  <div className="flex space-x-2">
                    <Tooltip content={copied ? "Copied!" : "Copy response"}>
                      <button
                        onClick={() => copyToClipboard(response)}
                        className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-full transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Share">
                      <button
                        onClick={shareContent}
                        className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-full transition-colors"
                      >
                        <Share className="h-3.5 w-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">{response}</p>
                
                <div className="mt-4 flex justify-end">
                  <Tooltip content="Add this follow-up to the main conversation thread">
                    <button
                      onClick={handleAddToMainThread}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/50 hover:bg-green-200 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add to Main Thread
                    </button>
                  </Tooltip>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
