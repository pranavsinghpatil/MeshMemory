import React, { useState } from 'react';
import { Search, Loader2, MessageSquare, Clock, ExternalLink, MessageCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import MicroThreadModal from '../components/MicroThreadModal';
import { supabase } from '../lib/supabase';
import { generateEmbedding } from '../utils/embeddings';
import { routeToLLM } from '../lib/llmRouter';

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
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);

      // Search for similar chunks with source information
      const { data: matches } = await supabase
        .rpc('match_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 10,
        });

      if (matches?.length > 0) {
        // Enrich results with source information
        const enrichedResults = await Promise.all(
          matches.map(async (match: any) => {
            const { data: chunk } = await supabase
              .from('chunks')
              .select(`
                *,
                sources (
                  id,
                  title,
                  type,
                  url,
                  created_at
                )
              `)
              .eq('id', match.id)
              .single();

            return {
              ...match,
              ...chunk,
              source: chunk?.sources
            };
          })
        );

        setResults(enrichedResults);

        // Generate AI response if we have matches
        const context = enrichedResults.slice(0, 3).map((match: any) => match.text_chunk).join('\n\n');
        
        const response = await routeToLLM({
          prompt: `Based on this context from the user's conversations:\n\n${context}\n\nAnswer this question: ${query}`,
          modelPreference: 'gpt-4',
          systemPrompt: 'You are a helpful assistant that answers questions based on the user\'s previous AI conversations. Be concise and reference the context when relevant.',
        });

        setAiResponse(response.responseText);

        // Save this as a micro-thread if we have a good match
        if (enrichedResults[0]?.similarity > 0.8) {
          await supabase
            .from('micro_threads')
            .insert({
              parent_chunk_id: enrichedResults[0].id,
              user_prompt: query,
              assistant_response: response.responseText,
              model_used: response.modelUsed,
            });
        }
      }
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

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.9) return 'bg-green-100 text-green-800';
    if (similarity >= 0.8) return 'bg-blue-100 text-blue-800';
    if (similarity >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'chatgpt-link':
        return '🤖';
      case 'youtube-link':
        return '📺';
      case 'pdf':
        return '📄';
      default:
        return '💬';
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Search</h1>
            <p className="mt-2 text-lg text-gray-600">
              Ask across all your AI conversations and discover insights
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask across all your AI conversations..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-colors"
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
            <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Response</h3>
                  <p className="text-gray-700 leading-relaxed">{aiResponse}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchPerformed && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Results
                </h2>
                {results.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {results.length} result{results.length !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>

              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.slice(0, 5).map((result: any, index) => (
                    <div key={result.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Header with similarity and source info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSimilarityColor(result.similarity)}`}>
                            {Math.round(result.similarity * 100)}% match
                          </span>
                          <span className="text-sm text-gray-500">
                            Result {index + 1}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFollowUp(result)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Follow up"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewContext(result)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="View in full context"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Chunk Text */}
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Chunk Text</h3>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md">
                          {result.text_chunk}
                        </p>
                      </div>

                      {/* Source Info */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Source Info</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getSourceIcon(result.source?.type)}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {result.source?.title || 'Untitled Source'}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {result.source?.type?.replace('-', ' ')} • {' '}
                                {new Date(result.source?.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Link
                            to={`/conversations/${result.source?.id}`}
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                          >
                            View Source
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </div>

                      {/* Participant info if available */}
                      {result.participant_label && (
                        <div className="mt-3 flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          From {result.participant_label} • {new Date(result.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white shadow rounded-lg">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search query or import more content to search through.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!searchPerformed && (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Start searching</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter a question or search term to find relevant content from your conversations.
              </p>
              <div className="mt-6">
                <div className="text-sm text-gray-600 space-y-2">
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
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
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