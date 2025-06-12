import React, { useState, useEffect } from 'react';
import { Search, Loader2, MessageSquare, Clock, AlertCircle, Bookmark } from 'lucide-react';
import Layout from '../components/Layout';
import MicroThreadModal from '../components/MicroThreadModal';
import SearchResultCard from '../components/SearchResultCard';
import EnhancedSearchFilters from '../components/EnhancedSearchFilters';

interface SearchFilters {
  sourceTypes: string[];
  dateFrom: string;
  dateTo: string;
  participant: string;
  searchType: 'semantic' | 'text' | 'hybrid';
}

export default function EnhancedSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState<any>(null);
  const [microThreadModalOpen, setMicroThreadModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    sourceTypes: [],
    dateFrom: '',
    dateTo: '',
    participant: '',
    searchType: 'hybrid'
  });

  // Get search suggestions when query changes
  useEffect(() => {
    const getSuggestions = async () => {
      if (query.length >= 3) {
        try {
          const response = await fetch(`/api/search/suggestions/enhanced?q=${encodeURIComponent(query)}&include_history=true`);
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (query.length >= 3) {
        getSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Load saved searches
  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      const response = await fetch('/api/search/saved');
      const data = await response.json();
      setSavedSearches(data.savedSearches || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearchPerformed(true);
    setResults([]);
    setAiResponse('');
    setError(null);
    setProcessingTime(null);

    try {
      const startTime = performance.now();
      
      // Build query parameters
      const params = new URLSearchParams({
        q: query,
        search_type: filters.searchType,
        limit: '10',
        threshold: '0.7'
      });

      if (filters.sourceTypes.length > 0) {
        filters.sourceTypes.forEach(type => params.append('source_types', type));
      }
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);
      if (filters.participant) params.append('participant', filters.participant);

      const response = await fetch(`/api/search/enhanced?${params}`);
      const data = await response.json();
      
      const endTime = performance.now();
      
      setResults(data.results || []);
      setAiResponse(data.aiResponse || '');
      setProcessingTime(Math.round(endTime - startTime));
      
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = (result: any) => {
    setSelectedChunk(result);
    setMicroThreadModalOpen(true);
  };

  const handleViewContext = (result: any) => {
    window.open(`/conversations/${result.source?.id}`, '_blank');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Trigger search immediately
    setTimeout(() => handleSearch(), 100);
  };

  const clearFilters = () => {
    setFilters({
      sourceTypes: [],
      dateFrom: '',
      dateTo: '',
      participant: '',
      searchType: 'hybrid'
    });
  };

  const saveCurrentSearch = async () => {
    if (!query.trim()) return;
    
    try {
      const response = await fetch('/api/search/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filters,
          name: `Search: ${query.substring(0, 30)}...`
        })
      });
      
      if (response.ok) {
        loadSavedSearches();
      }
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enhanced Search</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Advanced search with filters and multiple search modes
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
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
                
                {/* Search suggestions */}
                {suggestions.length > 0 && !loading && !searchPerformed && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
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
              
              {query.trim() && (
                <button
                  type="button"
                  onClick={saveCurrentSearch}
                  className="inline-flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  title="Save search"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Enhanced Filters */}
          <EnhancedSearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Saved Searches</h3>
              <div className="flex flex-wrap gap-2">
                {savedSearches.slice(0, 5).map((search: any) => (
                  <button
                    key={search.id}
                    onClick={() => {
                      setQuery(search.query);
                      setFilters(search.filters || filters);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {search.name || search.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                    Search Error
                  </h3>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  
                  {processingTime && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Processed in {processingTime}ms • {filters.searchType} search
                    </p>
                  )}
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
                    Try adjusting your search query or filters, or import more content to search through.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!searchPerformed && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors">
              <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Enhanced Search</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Use advanced filters and multiple search modes to find exactly what you're looking for.
              </p>
              <div className="mt-6">
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <p><strong>Search Types:</strong></p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    <span className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      Semantic: AI-powered meaning search
                    </span>
                    <span className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                      Text: Traditional keyword search
                    </span>
                    <span className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                      Hybrid: Best of both worlds
                    </span>
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
          console.log('Micro-thread created from enhanced search');
        }}
      />
    </Layout>
  );
}