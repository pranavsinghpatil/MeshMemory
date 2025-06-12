import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  Flag, 
  GitBranch, 
  Tag, 
  Settings,
  RefreshCw,
  Clock,
  Link,
  MessageSquare,
  ChevronRight,
  X
} from 'lucide-react';
import ThreadSummary from './ThreadSummary';
import { conversationsAPI, threadsAPI } from '../lib/api';
import Tooltip from './Tooltip';

interface ContextPanelProps {
  sourceId?: string;
  threadId?: string;
  onClose: () => void;
}

export default function ContextPanel({ sourceId, threadId, onClose }: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState('memory');
  const [summary, setSummary] = useState<string | null>(null);
  const [relatedThreads, setRelatedThreads] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [parallelChats, setParallelChats] = useState<any[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [regeneratingSummary, setRegeneratingSummary] = useState(false);

  useEffect(() => {
    if (sourceId || threadId) {
      fetchContextData();
    }
  }, [sourceId, threadId]);

  const fetchContextData = async () => {
    setLoading(true);
    try {
      // Fetch summary
      if (threadId) {
        const threadData = await threadsAPI.getThread(threadId);
        setSummary(threadData.summary || null);
        
        // Get related threads based on embedding similarity
        const related = await threadsAPI.getRelatedThreads(threadId);
        setRelatedThreads(related || []);
        
        // Get tags
        setTags(threadData.topics || []);
      } else if (sourceId) {
        const summaryData = await conversationsAPI.getConversationSummary(sourceId);
        setSummary(summaryData.summary || null);
        
        // Mock data for demo
        setRelatedThreads([
          { id: 'thread-1', title: 'React Hooks Discussion', similarity: 0.87 },
          { id: 'thread-2', title: 'State Management Patterns', similarity: 0.82 },
        ]);
        
        setTags(['React', 'JavaScript', 'Hooks', 'State Management']);
      }
      
      // Mock data for benchmarks and parallel chats
      setBenchmarks([
        { id: 'bm-1', name: 'Initial Question', timestamp: new Date().toISOString(), chunkId: 'chunk-1' },
        { id: 'bm-2', name: 'Key Insight', timestamp: new Date().toISOString(), chunkId: 'chunk-4' },
      ]);
      
      setParallelChats([
        { id: 'chat-1', title: 'Alternative Approach', created_at: new Date().toISOString() },
        { id: 'chat-2', title: 'Edge Case Exploration', created_at: new Date().toISOString() },
      ]);
      
    } catch (error) {
      console.error('Error fetching context data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!threadId && !sourceId) return;
    
    setRegeneratingSummary(true);
    try {
      if (threadId) {
        const result = await threadsAPI.regenerateSummary(threadId);
        setSummary(result.summary);
      } else if (sourceId) {
        const result = await conversationsAPI.getConversationSummary(sourceId, true);
        setSummary(result.summary);
      }
    } catch (error) {
      console.error('Error regenerating summary:', error);
    } finally {
      setRegeneratingSummary(false);
    }
  };

  const tabs = [
    { id: 'memory', name: 'Memory', icon: BookOpen },
    { id: 'related', name: 'Related', icon: Link },
    { id: 'benchmarks', name: 'Benchmarks', icon: Flag },
    { id: 'parallel', name: 'Parallel', icon: GitBranch },
    { id: 'tags', name: 'Tags', icon: Tag },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-80 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Context Panel</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Memory Tab */}
            {activeTab === 'memory' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Snapshot</h4>
                  <Tooltip content="Regenerate summary">
                    <button
                      onClick={handleRegenerateSummary}
                      disabled={regeneratingSummary}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`h-4 w-4 ${regeneratingSummary ? 'animate-spin' : ''}`} />
                    </button>
                  </Tooltip>
                </div>
                
                {summary ? (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">{summary}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Last updated: {new Date().toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400">No summary available</p>
                    <button
                      onClick={handleRegenerateSummary}
                      disabled={regeneratingSummary}
                      className="mt-2 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      Generate Summary
                    </button>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Points</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">React hooks provide state management in functional components</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">Context API helps avoid prop drilling in component trees</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">Performance optimizations include memoization and virtualization</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Related Threads */}
            {activeTab === 'related' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Related Threads</h4>
                
                {relatedThreads.length > 0 ? (
                  <div className="space-y-3">
                    {relatedThreads.map((thread) => (
                      <div key={thread.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">{thread.title}</h5>
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                            {Math.round(thread.similarity * 100)}% match
                          </span>
                        </div>
                        <div className="flex mt-2">
                          <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                            Switch Context
                          </button>
                          <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                          <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                            Fuse Threads
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400">No related threads found</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Benchmarks */}
            {activeTab === 'benchmarks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversation Benchmarks</h4>
                  <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    Create Digest
                  </button>
                </div>
                
                {benchmarks.length > 0 ? (
                  <div className="space-y-3">
                    {benchmarks.map((benchmark) => (
                      <div key={benchmark.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">{benchmark.name}</h5>
                          <Flag className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(benchmark.timestamp).toLocaleString()}
                        </p>
                        <button className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                          Jump to Point
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400">No benchmarks set</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Flag important points in the conversation to create benchmarks
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Parallel Chats */}
            {activeTab === 'parallel' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Parallel Conversations</h4>
                  <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    New Parallel
                  </button>
                </div>
                
                {parallelChats.length > 0 ? (
                  <div className="space-y-3">
                    {parallelChats.map((chat) => (
                      <div key={chat.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center">
                          <GitBranch className="h-4 w-4 text-indigo-500 dark:text-indigo-400 mr-2" />
                          <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">{chat.title}</h5>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Created {new Date(chat.created_at).toLocaleString()}
                        </p>
                        <div className="flex mt-2">
                          <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                            Switch to
                          </button>
                          <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                          <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                            Merge Back
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400">No parallel chats</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Create parallel chats to explore alternative approaches
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Tags */}
            {activeTab === 'tags' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags & Topics</h4>
                  <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    Add Tag
                  </button>
                </div>
                
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div key={index} className="flex items-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-full text-xs">
                        <span>{tag}</span>
                        <button className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400">No tags added</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggested Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      React
                    </button>
                    <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Hooks
                    </button>
                    <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Performance
                    </button>
                    <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Frontend
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat Settings</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stitch Sensitivity
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.95"
                      step="0.05"
                      defaultValue="0.7"
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Loose</span>
                      <span>Balanced</span>
                      <span>Strict</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Privacy Settings
                    </label>
                    <select className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm text-sm">
                      <option value="private">Private (Only you)</option>
                      <option value="shared">Shared (With link)</option>
                      <option value="public">Public (Anyone)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Model
                    </label>
                    <select className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm text-sm">
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="claude">Claude</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="auto-summarize"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="auto-summarize" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Auto-summarize conversation
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="auto-benchmark"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="auto-benchmark" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Auto-create benchmarks
                    </label>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}