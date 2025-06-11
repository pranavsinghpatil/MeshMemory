import React, { useState, useEffect } from 'react';
import { Key, Check, X, Loader2, AlertCircle, Info } from 'lucide-react';
import { userAPI } from '../lib/api';

interface APIKeyFormProps {
  onSave?: () => void;
}

export default function APIKeyForm({ onSave }: APIKeyFormProps) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({
    openai: null,
    gemini: null,
    claude: null
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved API keys
    const fetchApiKeys = async () => {
      try {
        const keys = await userAPI.getApiKeys();
        setOpenaiKey(keys.openai || '');
        setGeminiKey(keys.gemini || '');
        setClaudeKey(keys.claude || '');
        
        // Set test results for existing keys
        setTestResults({
          openai: keys.openai ? true : null,
          gemini: keys.gemini ? true : null,
          claude: keys.claude ? true : null
        });
      } catch (error) {
        console.error('Failed to load API keys:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  const testApiKey = async (provider: 'openai' | 'gemini' | 'claude', key: string) => {
    if (!key) {
      setTestResults(prev => ({ ...prev, [provider]: null }));
      return;
    }

    setTestResults(prev => ({ ...prev, [provider]: null }));
    setLoading(true);
    
    try {
      const result = await userAPI.testApiKey(provider, key);
      setTestResults(prev => ({ ...prev, [provider]: result.valid }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [provider]: false }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await userAPI.saveApiKeys({
        openai: openaiKey,
        gemini: geminiKey,
        claude: claudeKey
      });
      
      setSuccess('API keys saved successfully');
      if (onSave) onSave();
    } catch (error) {
      setError('Failed to save API keys');
      console.error('Error saving API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Keys</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Add your API keys to use your own accounts with various LLM providers
        </p>
      </div>

      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">Your API keys are stored securely</p>
            <p className="mt-1">Keys are encrypted and only used for requests from your account. We never share your API keys with third parties.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OpenAI API Key */}
        <div>
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              OpenAI API Key
            </span>
            {testResults.openai !== null && (
              <span className={`text-xs px-2 py-1 rounded-full flex items-center ${
                testResults.openai 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {testResults.openai 
                  ? <><Check className="h-3 w-3 mr-1" /> Valid</> 
                  : <><X className="h-3 w-3 mr-1" /> Invalid</>}
              </span>
            )}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="block w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="sk-..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                onClick={() => testApiKey('openai', openaiKey)}
                disabled={loading || !openaiKey}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mr-2"
              >
                Test
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Used for GPT-4 and GPT-3.5 models
          </p>
        </div>

        {/* Gemini API Key */}
        <div>
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Google Gemini API Key
            </span>
            {testResults.gemini !== null && (
              <span className={`text-xs px-2 py-1 rounded-full flex items-center ${
                testResults.gemini 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {testResults.gemini 
                  ? <><Check className="h-3 w-3 mr-1" /> Valid</> 
                  : <><X className="h-3 w-3 mr-1" /> Invalid</>}
              </span>
            )}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="block w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="AI..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                onClick={() => testApiKey('gemini', geminiKey)}
                disabled={loading || !geminiKey}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mr-2"
              >
                Test
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Used for Gemini Pro models
          </p>
        </div>

        {/* Claude API Key */}
        <div>
          <label className="flex items-center justify-between">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Anthropic Claude API Key
            </span>
            {testResults.claude !== null && (
              <span className={`text-xs px-2 py-1 rounded-full flex items-center ${
                testResults.claude 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {testResults.claude 
                  ? <><Check className="h-3 w-3 mr-1" /> Valid</> 
                  : <><X className="h-3 w-3 mr-1" /> Invalid</>}
              </span>
            )}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="password"
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              className="block w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="sk-ant-..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                onClick={() => testApiKey('claude', claudeKey)}
                disabled={loading || !claudeKey}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mr-2"
              >
                Test
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Used for Claude models (optional)
          </p>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 mr-2" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex">
              <Check className="h-5 w-5 text-green-400 dark:text-green-500 mr-2" />
              <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save API Keys'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}