import React, { useState } from 'react';
import { X, Flag, Loader2 } from 'lucide-react';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  chunk: any;
  onCreateBenchmark: (name: string, notes: string) => Promise<void>;
}

export default function BenchmarkModal({
  isOpen,
  onClose,
  chunk,
  onCreateBenchmark
}: BenchmarkModalProps) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !chunk) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await onCreateBenchmark(name, notes);
      onClose();
    } catch (error) {
      console.error('Error creating benchmark:', error);
      setError('Failed to create benchmark. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Flag className="h-6 w-6 text-amber-500 dark:text-amber-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create Benchmark</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Source Context */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-amber-500 dark:border-amber-400">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Benchmark Point:</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{chunk.text_chunk}</p>
              {chunk.participant_label && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">— {chunk.participant_label}</p>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Benchmark Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Key Insight, Important Question"
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Why is this point important?"
                    rows={3}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}
              </div>

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
                  disabled={loading || !name.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4 mr-2" />
                      Create Benchmark
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}