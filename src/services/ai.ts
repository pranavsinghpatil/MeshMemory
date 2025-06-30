import { api } from './api';

export interface AIModelConfig {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  apiKeyRequired: boolean;
  enabled: boolean;
}

export interface AIResponse {
  content: string;
  modelUsed: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
}

export interface AIRequestOptions {
  model?: string; // Default model if not specified
  maxTokens?: number;
  temperature?: number;
  attachments?: {
    name: string;
    type: string;
    content: string | ArrayBuffer;
  }[];
}

// Available AI models
export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google Gemini Pro model',
    maxTokens: 4096,
    apiKeyRequired: true,
    enabled: true
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'OpenAI GPT-4 model (Coming Soon)',
    maxTokens: 8192,
    apiKeyRequired: true,
    enabled: false
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic Claude model (Coming Soon)',
    maxTokens: 100000,
    apiKeyRequired: true,
    enabled: false
  }
];

// Check if Gemini API key is configured
export const isGeminiConfigured = (): boolean => {
  const geminiKey = localStorage.getItem('gemini-api-key');
  return !!geminiKey;
};

// Save Gemini API key to local storage
export const saveGeminiApiKey = (apiKey: string): void => {
  localStorage.setItem('gemini-api-key', apiKey);
};

// Get Gemini API key from local storage
export const getGeminiApiKey = (): string | null => {
  return localStorage.getItem('gemini-api-key');
};

// Send a message to the AI model and get a response
export const sendMessageToAI = async (
  message: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  options: AIRequestOptions = {}
): Promise<AIResponse> => {
  const model = options.model || 'gemini';
  
  try {
    // For now, we'll implement Gemini specifically as it's the only enabled model
    if (model === 'gemini') {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        throw new Error('Gemini API key not configured. Please add your API key in settings.');
      }
      
      // Use the backend proxy to call Gemini
      const response = await api.post('/ai/gemini/chat', {
        message,
        chatHistory,
        apiKey,
        maxTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        attachments: options.attachments || []
      });
      
      return {
        content: response.data.content,
        modelUsed: 'gemini',
        tokens: response.data.tokens
      };
    } else {
      throw new Error(`Model ${model} is not currently supported.`);
    }
  } catch (error: any) {
    console.error('Error sending message to AI:', error);
    throw new Error(error.message || 'Failed to get AI response');
  }
};

// Process a file and extract text content for AI processing
export const extractTextFromFile = async (file: File): Promise<string> => {
  // Simple text extraction based on file type
  if (file.type.startsWith('text/')) {
    return await file.text();
  }
  
  // For images, PDFs, etc. we would need OCR or other processing
  // This would typically be handled on the backend
  // For now, just return the file name and type as placeholder
  return `[File: ${file.name}, Type: ${file.type}]`;
};

// The AI service object with all functions
export const aiService = {
  getModels: () => AI_MODELS,
  getEnabledModels: () => AI_MODELS.filter(model => model.enabled),
  sendMessage: sendMessageToAI,
  isGeminiConfigured,
  saveGeminiApiKey,
  getGeminiApiKey,
  extractTextFromFile
};
