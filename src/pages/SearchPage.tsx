import React, { useState } from 'react';
import { Search, Loader2, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import MicroThreadModal from '../components/MicroThreadModal';
import SearchResultCard from '../components/SearchResultCard';
import { searchAPI } from '../lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState<any>(null);
  const [microThreadModalOpen, setMicroThreadModalOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearchPerformed(true);
    setResults([]);
    setAiResponse('');

    try {
      const response = await searchAPI.search(query);
      
      setResults(response.results || []);
      setAiResponse(response.aiResponse || '');
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = (result: any) => {
    setSelectedChunk(result);
    setMicroThreadModalOpen(true);
  };

  const handleViewContext = (result: any) => {
    // Navigate to the full conversation
    window.open(`/conversations/${result.source?.id}`, '_blank');
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Search</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Ask across all your AI conversations and discover insights
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask across all your AI conversations..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>

          {/* AI Response */}
          {aiResponse && (
            <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">AI Response</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{aiResponse}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchPerformed && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Search Results
                </h2>
                {results.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>

              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result: any, index) => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      index={index}
                      onFollowUp={() => handleFollowUp(result)}
                      onViewContext={() => handleViewContext(result)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors">
                  <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No results found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search query or import more content to search through.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!searchPerformed && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors">
              <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Start searching</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter a question or search term to find relevant content from your conversations.
              </p>
              <div className="mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <p><strong>Try asking:</strong></p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {[
                      "What did I learn about React?",
                      "Show me discussions about AI",
                      "Find conversations about productivity",
                      "What advice did I get about career?"
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setQuery(example)}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MicroThreadModal
        isOpen={microThreadModalOpen}
        onClose={() => setMicroThreadModalOpen(false)}
        chunk={selectedChunk}
        onMicroThreadCreated={() => {
          // Optionally refresh search results
          console.log('Micro-thread created from search');
        }}
      />
    </Layout>
  );
}