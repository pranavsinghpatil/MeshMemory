import os
import asyncio
from typing import Dict, Any, Optional
import openai
import google.generativeai as genai

class LLMService:
    def __init__(self):
        # Initialize OpenAI
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Initialize Gemini
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    async def route_to_llm(
        self,
        prompt: str,
        model_preference: str = "gpt-4",
        system_prompt: str = "You are a helpful AI assistant.",
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Route request to appropriate LLM based on preference and availability
        """
        full_prompt = prompt
        if context:
            full_prompt = f"Context: {context}\n\nQuestion: {prompt}"

        # Try preferred model first
        if model_preference in ["gpt-4", "gpt-3.5-turbo"]:
            try:
                response = await self._call_openai(full_prompt, model_preference, system_prompt)
                return {
                    "responseText": response,
                    "modelUsed": model_preference
                }
            except Exception as e:
                print(f"OpenAI error: {e}")
                # Fall back to Gemini

        # Use Gemini as default or fallback
        try:
            response = await self._call_gemini(full_prompt)
            return {
                "responseText": response,
                "modelUsed": "gemini-pro"
            }
        except Exception as e:
            print(f"Gemini error: {e}")
            raise Exception("All LLM providers failed")

    async def _call_openai(self, prompt: str, model: str, system_prompt: str) -> str:
        """Call OpenAI API"""
        try:
            response = await openai.ChatCompletion.acreate(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")

    async def _call_gemini(self, prompt: str) -> str:
        """Call Gemini API"""
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")

    async def generate_summary(self, text: str) -> str:
        """Generate a summary of the given text"""
        prompt = f"Please provide a concise summary of the following text:\n\n{text}"
        result = await self.route_to_llm(
            prompt=prompt,
            system_prompt="You are an expert at creating concise, informative summaries."
        )
        return result["responseText"]

    async def extract_topics(self, text: str) -> list:
        """Extract main topics from text"""
        prompt = f"Extract the main topics discussed in this text. Return only a comma-separated list of topics:\n\n{text}"
        result = await self.route_to_llm(
            prompt=prompt,
            system_prompt="You are an expert at identifying key topics in conversations."
        )
        
        topics = [topic.strip() for topic in result["responseText"].split(",")]
        return topics[:5]  # Limit to 5 topics