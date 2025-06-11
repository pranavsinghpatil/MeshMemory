import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, User, Bot, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function ConversationView() {
  const { sourceId } = useParams();
  const [source, setSource] = useState<any>(null);
  const [chunks, setChunks] = useState([]);
  const [microThreads, setMicroThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sourceId) {
      fetchConversationData();
    }
  }, [sourceId]);

  async function fetchConversationData() {
    try {
      // Fetch source details
      const { data: sourceData } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .single();

      setSource(sourceData);

      // Fetch chunks for this source
      const { data: chunksData } = await supabase
        .from('chunks')
        .select('*')
        .eq('source_id', sourceId)
        .order('timestamp', { ascending: true });

      setChunks(chunksData || []);

      // Fetch micro-threads for chunks in this source
      if (chunksData?.length) {
        const chunkIds = chunksData.map(chunk => chunk.id);
        const { data: microThreadsData } = await supabase
          .from('micro_threads')
          .select('*')
          .in('parent_chunk_id', chunkIds)
          .order('created_at', { ascending: true });

        setMicroThreads(microThreadsData || []);
      }
    } catch (error) {
      console.error('Error fetching conversation data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!source) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Source not found</h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {source.title || 'Untitled Source'}
                </h1>
                <p className="text-sm text-gray-500">
                  {source.type} • Created {new Date(source.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Original Content */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Original Content</h3>
                <div className="space-y-4">
                  {chunks.map((chunk: any) => (
                    <div key={chunk.id} className="border-l-4 border-indigo-200 pl-4">
                      <p className="text-gray-700">{chunk.text_chunk}</p>
                      {chunk.participant_label && (
                        <p className="text-sm text-gray-500 mt-2">
                          — {chunk.participant_label}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(chunk.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {chunks.length === 0 && (
                    <p className="text-gray-500 italic">No content chunks available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Micro-threads */}
            {microThreads.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Related Conversations
                  </h3>
                  <div className="space-y-6">
                    {microThreads.map((thread: any) => (
                      <div key={thread.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">You</p>
                              <p className="text-gray-700">{thread.user_prompt}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                AI ({thread.model_used})
                              </p>
                              <p className="text-gray-700">{thread.assistant_response}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(thread.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {chunks.length === 0 && microThreads.length === 0 && (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No content available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This source hasn't been processed yet or contains no content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}