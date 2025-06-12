import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { supabase } from './supabase';

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Initialize Google Generative AI with API key from environment
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Anthropic Claude API (placeholder - would need actual implementation)
const anthropic = {
  async generateText(prompt: string, options: any = {}) {
    throw new Error('Claude API not implemented');
  }
};

interface LLMRouterParams {
  prompt: string;
  modelPreference?: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini' | 'claude';
  systemPrompt?: string;
  context?: string;
  userId?: string;
}

interface LLMResponse {
  responseText: string;
  modelUsed: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  latencyMs: number;
}

// Helper function to detect if a prompt requires advanced reasoning
function requiresAdvancedReasoning(prompt: string): boolean {
  const complexPatterns = [
    /code|program|function|algorithm|debug/i,
    /explain in detail|complex|complicated|analyze|compare and contrast/i,
    /math|equation|calculate|formula|proof/i,
    /logical|reasoning|philosophy|ethics|argument/i,
    /step by step|breakdown|how would you|implement/i
  ];
  
  return complexPatterns.some(pattern => pattern.test(prompt));
}

// Helper function to check if a response is too generic or short
function isLowQualityResponse(text: string): boolean {
  // Check if response is too short
  if (text.split(' ').length < 30) return true;
  
  // Check for generic uncertainty phrases
  const genericPhrases = [
    "I'm not sure",
    "I don't know",
    "I cannot provide",
    "I'm unable to",
    "I don't have enough information",
    "It's unclear",
    "I cannot determine"
  ];
  
  return genericPhrases.some(phrase => text.toLowerCase().includes(phrase.toLowerCase()));
}

// Log usage to database
async function logUsage(params: {
  userId?: string;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
}) {
  try {
    await supabase.from('usage_logs').insert({
      user_id: params.userId,
      model_used: params.modelUsed,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      total_tokens: params.promptTokens + params.completionTokens,
      latency_ms: params.latencyMs,
      success: params.success,
      error_message: params.errorMessage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log usage:', error);
  }
}

// Get user's API keys from database
async function getUserApiKeys(userId?: string): Promise<Record<string, string>> {
  if (!userId) return {};
  
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('api_keys')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) return {};
    
    return data.api_keys || {};
  } catch (error) {
    console.error('Failed to get user API keys:', error);
    return {};
  }
}

// Estimate token count for OpenAI models
function estimateTokenCount(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

export async function routeToLLM({
  prompt,
  modelPreference,
  systemPrompt = 'You are a helpful AI assistant.',
  context,
  userId
}: LLMRouterParams): Promise<LLMResponse> {
  const startTime = performance.now();
  let promptTokens = 0;
  let completionTokens = 0;
  let responseText = '';
  let modelUsed = '';
  let success = false;
  let errorMessage = '';
  
  // Get user's API keys if available
  const userApiKeys = await getUserApiKeys(userId);
  
  // Prepare full prompt with context if provided
  const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
  promptTokens = estimateTokenCount(fullPrompt) + estimateTokenCount(systemPrompt);
  
  // Determine best model based on prompt complexity if no preference specified
  if (!modelPreference) {
    if (requiresAdvancedReasoning(prompt)) {
      modelPreference = 'gpt-4';
    } else {
      modelPreference = 'gemini';
    }
  }
  
  // Try preferred model first
  try {
    if (modelPreference === 'gpt-4' || modelPreference === 'gpt-3.5-turbo') {
      // Use user's OpenAI key if available, otherwise use default
      const apiKey = userApiKeys.openai || import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not available');
      }
      
      // Create a new instance with the appropriate key
      const client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      
      const response = await client.chat.completions.create({
        model: modelPreference,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt },
        ],
        temperature: 0.7,
      });

      responseText = response.choices[0]?.message?.content || '';
      modelUsed = modelPreference;
      promptTokens = response.usage?.prompt_tokens || promptTokens;
      completionTokens = response.usage?.completion_tokens || estimateTokenCount(responseText);
      success = true;
    } else if (modelPreference === 'gemini') {
      // Use user's Gemini key if available, otherwise use default
      const apiKey = userApiKeys.gemini || import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not available');
      }
      
      // Create a new instance with the appropriate key
      const geminiAI = new GoogleGenerativeAI(apiKey);
      const model = geminiAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      responseText = response.text();
      modelUsed = 'gemini-pro';
      completionTokens = estimateTokenCount(responseText);
      success = true;
      
      // Check response quality
      if (isLowQualityResponse(responseText)) {
        throw new Error('Low quality response from Gemini, trying GPT-4');
      }
    } else if (modelPreference === 'claude') {
      // Use user's Claude key if available
      const apiKey = userApiKeys.claude;
      
      if (!apiKey) {
        throw new Error('Claude API key not available');
      }
      
      // Claude implementation would go here
      throw new Error('Claude API not implemented');
    }
  } catch (error) {
    console.error(`Error with ${modelPreference}:`, error);
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Fallback logic
    try {
      // If GPT-4 failed, try Gemini
      if (modelPreference === 'gpt-4' || modelPreference === 'gpt-3.5-turbo') {
        console.log('Falling back to Gemini');
        const geminiAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = geminiAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        responseText = response.text();
        modelUsed = 'gemini-pro (fallback)';
        completionTokens = estimateTokenCount(responseText);
        success = true;
      } 
      // If Gemini failed, try GPT-3.5
      else if (modelPreference === 'gemini') {
        console.log('Falling back to GPT-3.5');
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullPrompt },
          ],
        });
        
        responseText = response.choices[0]?.message?.content || '';
        modelUsed = 'gpt-3.5-turbo (fallback)';
        promptTokens = response.usage?.prompt_tokens || promptTokens;
        completionTokens = response.usage?.completion_tokens || estimateTokenCount(responseText);
        success = true;
      }
      // If Claude failed, try GPT-3.5
      else if (modelPreference === 'claude') {
        console.log('Falling back to GPT-3.5');
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullPrompt },
          ],
        });
        
        responseText = response.choices[0]?.message?.content || '';
        modelUsed = 'gpt-3.5-turbo (fallback)';
        promptTokens = response.usage?.prompt_tokens || promptTokens;
        completionTokens = response.usage?.completion_tokens || estimateTokenCount(responseText);
        success = true;
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      // If all else fails, return a graceful error message
      responseText = "I'm sorry, but I encountered an issue processing your request. Please try again later.";
      modelUsed = 'error-fallback';
      success = false;
      errorMessage += ` Fallback error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`;
    }
  }
  
  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);
  
  // Log usage
  await logUsage({
    userId,
    modelUsed,
    promptTokens,
    completionTokens,
    latencyMs,
    success,
    errorMessage: success ? undefined : errorMessage
  });
  
  return {
    responseText,
    modelUsed,
    tokenUsage: {
      prompt: promptTokens,
      completion: completionTokens,
      total: promptTokens + completionTokens
    },
    latencyMs
  };
}