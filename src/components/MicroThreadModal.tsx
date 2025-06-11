import React, { useState } from 'react';
import { X, Send, Loader2, MessageSquare, Plus } from 'lucide-react';
import { microThreadsAPI } from '../lib/api';

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

  if (!isOpen || !chunk) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMainThread = async () => {
    // This would add the micro-thread to the main conversation thread
    // Implementation depends on your threading logic
    console.log('Adding to main thread...');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Follow-up Question</h3>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Original Chunk */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-indigo-500 dark:border-indigo-400">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Context:</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{chunk.text_chunk}</p>
              {chunk.participant_label && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">— {chunk.participant_label}</p>
              )}
            </div>

            {/* Question Form */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a follow-up question about this content..."
                    rows={3}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="flex-shrink-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>

            {/* Response */}
            {response && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500 dark:border-green-400">
                <div className="flex items-center mb-2">
                  <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                    AI Response ({modelUsed})
                  </h4>
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">{response}</p>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAddToMainThread}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/50 hover:bg-green-200 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add to Main Thread
                  </button>
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