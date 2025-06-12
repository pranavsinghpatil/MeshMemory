import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, User, Bot, Send, Clock } from 'lucide-react';

interface FusedChatAreaProps {
  groupId: string;
  fusedChunks: any[];
  onSendMessage: (message: string) => Promise<void>;
}

export default function FusedChatArea({
  groupId,
  fusedChunks,
  onSendMessage
}: FusedChatAreaProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [fusedChunks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fused Conversation</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This view combines all member chats into a unified conversation
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Memory Snapshot */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">Group Context Summary</h4>
          <p className="text-sm text-indigo-700 dark:text-indigo-200">
            This thread group combines conversations about React state management, hooks, and performance optimization. 
            Key topics include useState vs useReducer, Context API usage, and strategies to minimize re-renders.
          </p>
        </div>

        {fusedChunks.map((chunk, index) => {
          const isUser = chunk.participant_label?.toLowerCase().includes('user') || 
                        chunk.participant_label?.toLowerCase().includes('human');
          
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs sm:max-w-md rounded-2xl p-4 ${
                isUser 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                <div className="flex items-center mb-2">
                  <div className={`h-6 w-6 rounded-full ${
                    isUser 
                      ? 'bg-indigo-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  } flex items-center justify-center mr-2`}>
                    {isUser ? (
                      <User className="h-3 w-3 text-white" />
                    ) : (
                      <Bot className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    isUser ? 'text-indigo-100' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {chunk.participant_label || (isUser ? 'You' : 'Assistant')}
                  </span>
                  {chunk.source_title && (
                    <span className={`ml-2 text-xs ${
                      isUser ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      from "{chunk.source_title}"
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  isUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {chunk.text_chunk}
                </p>
                <div className={`flex items-center mt-2 text-xs ${
                  isUser ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(chunk.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
        
        {fusedChunks.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No conversation content</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This group doesn't have any conversation content yet
            </p>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message to the group..."
            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>Sending to all group contexts</span>
          <span>Model: GPT-4</span>
        </div>
      </div>
    </div>
  );
}