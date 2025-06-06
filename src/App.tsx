import React, { useState, useEffect } from 'react';
import { MessageSquare, Upload, Search, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { routeToLLM } from './lib/llmRouter';
import { generateEmbedding } from './utils/embeddings';

function App() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    fetchSources();
    fetchThreads();
  }, []);

  async function fetchSources() {
    try {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  }

  async function fetchThreads() {
    try {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setThreads(data || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  }

  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // Create source
      const { data: source } = await supabase
        .from('sources')
        .insert({
          type: 'text',
          title: file.name,
        })
        .select()
        .single();

      // Read file content
      const text = await file.text();
      
      // Generate embedding
      const embedding = await generateEmbedding(text);
      
      // Save chunk
      await supabase
        .from('chunks')
        .insert({
          source_id: source.id,
          text_chunk: text,
          embedding,
        });

      await fetchSources();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!userInput.trim()) return;

    setLoading(true);
    try {
      const embedding = await generateEmbedding(userInput);
      const { data: matches } = await supabase
        .rpc('match_chunks', {
          query_embedding: embedding,
          match_threshold: 0.75,
          match_count: 5,
        });

      if (matches?.length) {
        const response = await routeToLLM({
          prompt: `Based on this context: "${matches[0].text_chunk}", answer: ${userInput}`,
          modelPreference: 'gpt-4',
        });

        await supabase
          .from('micro_threads')
          .insert({
            parent_chunk_id: matches[0].id,
            user_prompt: userInput,
            assistant_response: response.responseText,
            model_used: response.modelUsed,
          });
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
      setUserInput('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Chat Analysis</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <Upload className="h-5 w-5 text-gray-400" />
              <h2 className="ml-2 text-lg font-medium text-gray-900">Upload Source</h2>
            </div>
            <input
              type="file"
              onChange={handleUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>

          {/* Search Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <Search className="h-5 w-5 text-gray-400" />
              <h2 className="ml-2 text-lg font-medium text-gray-900">Search & Analyze</h2>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Threads</h2>
            <div className="space-y-4">
              {threads.map((thread) => (
                <div key={thread.id} className="p-4 border rounded-md">
                  <h3 className="font-medium text-gray-900">{thread.title}</h3>
                  <p className="text-sm text-gray-500">
                    Updated: {new Date(thread.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;