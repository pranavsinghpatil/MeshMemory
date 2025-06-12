import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  MessageCircle,
  Pin,
  Eye,
  Layers,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  Share,
  Download,
  Info,
  Flag,
  GitBranch,
  PanelRight,
  PanelRightClose
} from 'lucide-react';
import Layout from '../components/Layout';
import MicroThreadModal from '../components/MicroThreadModal';
import ConversationChunk from '../components/ConversationChunk';
import ThreadSummary from '../components/ThreadSummary';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import Tooltip from '../components/Tooltip';
import PaginatedChunkList from '../components/PaginatedChunkList';
import ContextPanel from '../components/ContextPanel';
import { conversationsAPI, microThreadsAPI } from '../lib/api';

export default function ConversationView() {
  const { sourceId } = useParams();
  const [source, setSource] = useState<any>(null);
  const [chunks, setChunks] = useState([]);
  const [microThreads, setMicroThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChunk, setSelectedChunk] = useState<any>(null);
  const [microThreadModalOpen, setMicroThreadModalOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [expandedMicroThreads, setExpandedMicroThreads] = useState<Record<string, boolean>>({});
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usePagination, setUsePagination] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversationData = useCallback(async () => {
    if (!sourceId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch conversation data with micro-threads included
      const conversation = await conversationsAPI.getConversation(sourceId);
      
      setSource({
        id: conversation.sourceId,
        title: conversation.title,
        type: conversation.sourceType,
        created_at: new Date().toISOString(), // Fallback
        metadata: conversation.metadata
      });
      
      // Process chunks and their micro-threads
      const processedChunks = conversation.chunks.map((chunk: any) => ({
        id: chunk.id,
        text_chunk: chunk.text,
        participant_label: chunk.participantLabel,
        timestamp: chunk.timestamp,
        model_name: chunk.modelName,
        microThreads: chunk.microThreads || []
      }));
      
      setChunks(processedChunks);
      
      // Collect all micro-threads
      const allMicroThreads = processedChunks.reduce((acc: any[], chunk: any) => {
        return [...acc, ...(chunk.microThreads || [])];
      }, []);
      
      setMicroThreads(allMicroThreads);
      
      // Check if chunks belong to a thread
      const firstChunkWithThread = processedChunks.find((chunk: any) => chunk.thread_id);
      if (firstChunkWithThread) {
        setThreadId(firstChunkWithThread.thread_id);
      }
      
      // Try to get a summary
      try {
        const summaryResponse = await conversationsAPI.getConversationSummary(sourceId);
        setSummary(summaryResponse.summary);
      } catch (error) {
        console.error('Error fetching summary:', error);
        setSummary(null);
      }
      
    } catch (error) {
      console.error('Error fetching conversation data:', error);
      setError('Failed to load conversation data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sourceId]);

  useEffect(() => {
    fetchConversationData();
  }, [fetchConversationData]);

  useEffect(() => {
    // Enable pagination for large conversations
    if (chunks.length > 100) {
      setUsePagination(true);
    }
  }, [chunks.length]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chunks]);

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

  const handleFlagBenchmark = (chunk: any) => {
    // Implementation for flagging a benchmark
    console.log('Flagging benchmark:', chunk.id);
    // Show context panel after flagging
    setShowContextPanel(true);
  };

  const handleSpawnParallel = (chunk: any) => {
    // Implementation for spawning a parallel chat
    console.log('Spawning parallel chat from:', chunk.id);
    // Show context panel after spawning
    setShowContextPanel(true);
  };

  const toggleMicroThread = (chunkId: string) => {
    setExpandedMicroThreads(prev => ({
      ...prev,
      [chunkId]: !prev[chunkId]
    }));
  };

  const copyConversationToClipboard = () => {
    if (!chunks.length) return;
    
    const text = chunks.map((chunk: any) => {
      return `${chunk.participant_label || 'Unknown'}: ${chunk.text_chunk}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setCopySuccess('Failed to copy');
    });
  };

  const downloadConversation = () => {
    if (!chunks.length) return;
    
    const text = chunks.map((chunk: any) => {
      return `${chunk.participant_label || 'Unknown'} (${new Date(chunk.timestamp).toLocaleString()}):\n${chunk.text_chunk}`;
    }).join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${source?.title || 'conversation'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <SkeletonLoader type="conversation" className="mt-6" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <ErrorMessage
              title="Error Loading Conversation"
              message={error}
              onRetry={fetchConversationData}
              showHomeLink={true}
              className="mt-6"
            />
          </div>
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
      <div className="py-6 h-full">
        <div className="h-full flex">
          {/* Main Content */}
          <div className={`flex-1 px-4 sm:px-6 md:px-8 ${showContextPanel ? 'mr-80' : ''}`}>
            {/* Header */}
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
              <div className="flex items-center justify-between">
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
                
                <div className="flex space-x-2">
                  <Tooltip content="Copy conversation text">
                    <button 
                      onClick={copyConversationToClipboard}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      {copySuccess ? (
                        <span className="text-green-600 dark:text-green-400 text-xs font-medium">{copySuccess}</span>
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </Tooltip>
                  
                  <Tooltip content="Download as text file">
                    <button 
                      onClick={downloadConversation}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </Tooltip>
                  
                  <Tooltip content="Share conversation">
                    <button 
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <Share className="h-5 w-5" />
                    </button>
                  </Tooltip>
                  
                  <Tooltip content="Spawn parallel chat">
                    <button 
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <GitBranch className="h-5 w-5" />
                    </button>
                  </Tooltip>
                  
                  <Tooltip content={showContextPanel ? "Hide context panel" : "Show context panel"}>
                    <button 
                      onClick={() => setShowContextPanel(!showContextPanel)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      {showContextPanel ? (
                        <PanelRightClose className="h-5 w-5" />
                      ) : (
                        <PanelRight className="h-5 w-5" />
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Thread Summary */}
            {threadId && !showContextPanel && (
              <div className="mb-6">
                <ThreadSummary 
                  threadId={threadId}
                  initialSummary={summary}
                  onSummaryUpdate={setSummary}
                />
              </div>
            )}

            {/* Summary (if available and no thread) */}
            {summary && !threadId && !showContextPanel && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Summary</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">{summary}</p>
              </div>
            )}

            {/* Conversation Thread */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Conversation Thread</h3>
                  
                  {chunks.length > 50 && (
                    <div className="flex items-center">
                      <Tooltip content={usePagination ? "View all messages at once" : "Use pagination for better performance"}>
                        <button
                          onClick={() => setUsePagination(!usePagination)}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center"
                        >
                          {usePagination ? "View All" : "Use Pagination"}
                          <Info className="h-4 w-4 ml-1" />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
                
                {usePagination ? (
                  <PaginatedChunkList
                    sourceId={sourceId}
                    onFollowUp={handleFollowUp}
                    onPinToThread={handlePinToThread}
                    onSeeContext={handleSeeContext}
                  />
                ) : (
                  <div className="space-y-6">
                    {chunks.map((chunk: any) => (
                      <div key={chunk.id} className="space-y-2">
                        <ConversationChunk
                          chunk={chunk}
                          onFollowUp={() => handleFollowUp(chunk)}
                          onPinToThread={() => handlePinToThread(chunk)}
                          onSeeContext={() => handleSeeContext(chunk)}
                          onFlagBenchmark={() => handleFlagBenchmark(chunk)}
                          onSpawnParallel={() => handleSpawnParallel(chunk)}
                        />
                        
                        {/* Micro-threads for this chunk */}
                        {chunk.microThreads && chunk.microThreads.length > 0 && (
                          <div className="ml-12 mt-2">
                            <Tooltip content={`${chunk.microThreads.length} follow-up question${chunk.microThreads.length !== 1 ? 's' : ''}`}>
                              <button
                                onClick={() => toggleMicroThread(chunk.id)}
                                className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                              >
                                {expandedMicroThreads[chunk.id] ? (
                                  <>
                                    <ChevronUp className="h-3 w-3 mr-1" />
                                    Hide {chunk.microThreads.length} follow-up{chunk.microThreads.length !== 1 ? 's' : ''}
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                    Show {chunk.microThreads.length} follow-up{chunk.microThreads.length !== 1 ? 's' : ''}
                                  </>
                                )}
                              </button>
                            </Tooltip>
                            
                            {expandedMicroThreads[chunk.id] && (
                              <div className="mt-2 space-y-3 border-l-2 border-indigo-200 dark:border-indigo-800 pl-3">
                                {chunk.microThreads.map((thread: any) => (
                                  <div key={thread.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
                                    <div className="font-medium text-gray-900 dark:text-white mb-1">Q: {thread.userPrompt}</div>
                                    <div className="text-gray-700 dark:text-gray-300">A: {thread.assistantResponse}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {thread.modelUsed} • {new Date(thread.createdAt).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
                    
                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="mt-4 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <textarea
                  placeholder="Type your message..."
                  rows={3}
                  className="flex-1 resize-none rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                ></textarea>
                <div className="flex flex-col space-y-2">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Send
                  </button>
                  <Tooltip content="Spawn parallel chat">
                    <button
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <GitBranch className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Model:</span>
                  <select className="ml-2 text-xs rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gemini-pro">Gemini Pro</option>
                  </select>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Context: 4,235 tokens
                </div>
              </div>
            </div>

            {/* Micro-threads */}
            {microThreads.length > 0 && !showContextPanel && (
              <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-colors">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    All Follow-up Conversations ({microThreads.length})
                    <Tooltip 
                      content="Follow-up conversations (micro-threads) are additional questions you've asked about specific parts of the conversation."
                      position="top"
                    >
                      <Info className="h-4 w-4 ml-2 text-gray-400 dark:text-gray-500 cursor-help" />
                    </Tooltip>
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
          
          {/* Context Panel */}
          {showContextPanel && (
            <div className="fixed right-0 top-16 bottom-0 z-10">
              <ContextPanel 
                sourceId={sourceId} 
                threadId={threadId}
                onClose={() => setShowContextPanel(false)}
              />
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