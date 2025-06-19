import React, { useState, useEffect } from 'react';
import { Layers, Loader2, TrendingUp, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import ChatCard from '../components/ChatCard';
import { chatsAPI } from '../lib/api';

export default function ChatsPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('updated_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchChats();
  }, [sortBy]);

  async function fetchChats() {
    try {
      setLoading(true);
      const data = await chatsAPI.getAllChats();
      
      // Sort chats based on selected criteria
      const sortedChats = [...data].sort((a: any, b: any) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else {
          // For dates (updated_at or created_at)
          return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
        }
      });
      
      setChats(sortedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Chats</h1>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="updated_at">Recently Updated</option>
                <option value="created_at">Date Created</option>
                <option value="title">Title (A-Z)</option>
              </select>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? (
                  <Layers className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {chats.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No chats yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by importing a conversation or creating a new chat.
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'space-y-4'}>
              {chats.map((chat: any) => (
                <ChatCard 
                  key={chat.id} 
                  chat={chat} 
                  viewMode={viewMode} 
                  onDelete={fetchChats} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
