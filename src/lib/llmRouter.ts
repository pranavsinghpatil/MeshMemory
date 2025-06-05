import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface LLMRouterParams {
  prompt: string;
  modelPreference?: 'gpt-4' | 'gemini' | 'gpt-3.5-turbo';
  systemPrompt?: string;
}

interface LLMResponse {
  responseText: string;
  modelUsed: string;
}

export async function routeToLLM({
  prompt,
  modelPreference,
  systemPrompt = 'You are a helpful AI assistant.',
}: LLMRouterParams): Promise<LLMResponse> {
  // Try preferred model first
  if (modelPreference === 'gpt-4' || modelPreference === 'gpt-3.5-turbo') {
    try {
      const response = await openai.chat.completions.create({
        model: modelPreference,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      });

      return {
        responseText: response.choices[0]?.message?.content || '',
        modelUsed: modelPreference,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fall through to Gemini if OpenAI fails
    }
  }

  // Use Gemini as default or fallback
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Check response quality
    if (text.length < 20 || text.toLowerCase().includes("i'm not sure")) {
      // If low quality response and we haven't tried GPT-4 yet, retry with it
      if (modelPreference !== 'gpt-4') {
        try {
          const gpt4Response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
          });

          return {
            responseText: gpt4Response.choices[0]?.message?.content || '',
            modelUsed: 'gpt-4',
          };
        } catch (error) {
          console.error('GPT-4 fallback error:', error);
          // Return original Gemini response if GPT-4 fails
        }
      }
    }

    return {
      responseText: text,
      modelUsed: 'gemini-pro',
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('All LLM providers failed');
  }
}