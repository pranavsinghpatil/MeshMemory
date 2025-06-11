import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  MessageCircle,
  Pin,
  Eye,
  Layers,
  Loader2
} from 'lucide-react';
import Layout from '../components/Layout';
import MicroThreadModal from '../components/MicroThreadModal';
import ConversationChunk from '../components/ConversationChunk';
import { conversationsAPI, microThreadsAPI } from '../lib/api';

export default function ConversationView() {
  const { sourceId } = useParams();
  const [source, setSource] = useState<any>(null);
  const [chunks, setChunks] = useState([]);
  const [microThreads, setMicroThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChunk, setSelectedChunk] = useState<any>(null);
  const [microThreadModalOpen, setMicroThreadModalOpen] = useState(false);

  useEffect(() => {
    if (sourceId) {
      fetchConversationData();
    }
  }, [sourceId]);

  async function fetchConversationData() {
    try {
      setLoading(true);
      
      // Fetch conversation data
      const conversation = await conversationsAPI.getConversation(sourceId!);
      setSource({
        id: conversation.sourceId,
        title: conversation.title,
        type: conversation.sourceType,
        created_at: new Date().toISOString(), // Fallback
        metadata: conversation.metadata
      });
      
      setChunks(conversation.chunks.map((chunk: any) => ({
        id: chunk.id,
        text_chunk: chunk.text,
        participant_label: chunk.participantLabel,
        timestamp: chunk.timestamp,
        model_name: chunk.modelName
      })));
      
      // Fetch micro-threads for this source
      if (conversation.chunks.length > 0) {
        const chunkIds = conversation.chunks.map((chunk: any) => chunk.id);
        
        // For each chunk, fetch its micro-threads
        const microThreadsData = [];
        for (const chunkId of chunkIds) {
          try {
            const response = await microThreadsAPI.getMicroThreadsForChunk(chunkId);
            microThreadsData.push(...response.microThreads);
          } catch (error) {
            console.error(`Error fetching micro-threads for chunk ${chunkId}:`, error);
          }
        }
        
        setMicroThreads(microThreadsData);
      }
      
    } catch (error) {
      console.error('Error fetching conversation data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFollowUp = (chunk: any) => {
    setSelectedChunk(chunk);
    setMicroThreadModalOpen(true);
  };

  const handlePinToThread = async (chunk: any) => {
    // Implementation for pinning to thread
    console.log('Pinning chunk to thread:', chunk.id);
  };

  const handleSeeContext = (chunk: any) => {
    // Implementation for showing context
    console.log('Showing context for chunk:', chunk.id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (!source) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Source not found</h2>
          <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 mt-4 inline-block transition-colors">
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
              className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {source.title || 'Untitled Source'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {source.type} • Created {new Date(source.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Conversation Thread</h3>
              
              <div className="space-y-4">
                {chunks.map((chunk: any) => (
                  <ConversationChunk
                    key={chunk.id}
                    chunk={chunk}
                    onFollowUp={() => handleFollowUp(chunk)}
                    onPinToThread={() => handlePinToThread(chunk)}
                    onSeeContext={() => handleSeeContext(chunk)}
                  />
                ))}
                
                {chunks.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No conversation content</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This source hasn't been processed yet or contains no content.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Micro-threads */}
          {microThreads.length > 0 && (
            <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Follow-up Conversations
                </h3>
                <div className="space-y-6">
                  {microThreads.map((thread: any) => (
                    <div key={thread.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">You</p>
                            <p className="text-gray-700 dark:text-gray-300">{thread.userPrompt}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              AI ({thread.modelUsed})
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">{thread.assistantResponse}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(thread.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
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
        onMicroThreadCreated={fetchConversationData}
      />
    </Layout>
  );
}