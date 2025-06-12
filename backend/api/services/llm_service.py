import os
import asyncio
import time
import json
import uuid
from typing import Dict, Any, Optional, List
import openai
import google.generativeai as genai
from .database_service import DatabaseService

class LLMService:
    def __init__(self):
        # Initialize OpenAI
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Initialize Gemini
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            
        # Database service for logging
        self.db_service = DatabaseService()

    async def route_to_llm(
        self,
        prompt: str,
        model_preference: str = "gpt-4",
        system_prompt: str = "You are a helpful AI assistant.",
        context: Optional[str] = None,
        user_id: Optional[str] = None,
        user_api_keys: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Route request to appropriate LLM based on preference and availability
        """
        start_time = time.time()
        prompt_tokens = 0
        completion_tokens = 0
        
        # Prepare full prompt with context if provided
        full_prompt = prompt
        if context:
            full_prompt = f"Context: {context}\n\nQuestion: {prompt}"
            
        # Estimate prompt tokens (rough approximation)
        prompt_tokens = self._estimate_tokens(full_prompt) + self._estimate_tokens(system_prompt)
        
        # Determine if prompt requires advanced reasoning
        if not model_preference or model_preference == "auto":
            model_preference = "gpt-4" if self._requires_advanced_reasoning(prompt) else "gemini-pro"
        
        # Try preferred model first
        try:
            if model_preference in ["gpt-4", "gpt-3.5-turbo"]:
                # Use user's API key if provided
                api_key = user_api_keys.get("openai") if user_api_keys else self.openai_api_key
                if not api_key:
                    raise ValueError("OpenAI API key not available")
                
                # Save current API key to restore later
                original_api_key = openai.api_key
                openai.api_key = api_key
                
                try:
                    response = await openai.ChatCompletion.acreate(
                        model=model_preference,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": full_prompt}
                        ],
                        max_tokens=1000,
                        temperature=0.7
                    )
                    
                    response_text = response.choices[0].message.content
                    prompt_tokens = response.usage.prompt_tokens
                    completion_tokens = response.usage.completion_tokens
                    
                    # Restore original API key
                    openai.api_key = original_api_key
                    
                    # Log usage
                    await self._log_usage(
                        user_id=user_id,
                        model=model_preference,
                        prompt_tokens=prompt_tokens,
                        completion_tokens=completion_tokens,
                        latency_ms=int((time.time() - start_time) * 1000),
                        success=True
                    )
                    
                    return {
                        "responseText": response_text,
                        "modelUsed": model_preference,
                        "tokenUsage": {
                            "prompt": prompt_tokens,
                            "completion": completion_tokens,
                            "total": prompt_tokens + completion_tokens
                        }
                    }
                finally:
                    # Ensure we restore the original API key
                    openai.api_key = original_api_key
                    
            elif model_preference == "gemini-pro":
                # Use user's API key if provided
                api_key = user_api_keys.get("gemini") if user_api_keys else self.gemini_api_key
                if not api_key:
                    raise ValueError("Gemini API key not available")
                
                # Create a new instance with the user's API key
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-pro')
                
                response = await model.generate_content_async(full_prompt)
                response_text = response.text
                
                # Estimate completion tokens
                completion_tokens = self._estimate_tokens(response_text)
                
                # Check if response is too generic or short
                if self._is_low_quality_response(response_text):
                    raise ValueError("Low quality response from Gemini")
                
                # Log usage
                await self._log_usage(
                    user_id=user_id,
                    model="gemini-pro",
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    latency_ms=int((time.time() - start_time) * 1000),
                    success=True
                )
                
                return {
                    "responseText": response_text,
                    "modelUsed": "gemini-pro",
                    "tokenUsage": {
                        "prompt": prompt_tokens,
                        "completion": completion_tokens,
                        "total": prompt_tokens + completion_tokens
                    }
                }
                
            elif model_preference == "claude":
                # Claude implementation would go here
                raise ValueError("Claude API not implemented")
                
        except Exception as e:
            print(f"Error with {model_preference}: {e}")
            
            # Try fallback models
            try:
                # If GPT-4 failed, try Gemini
                if model_preference in ["gpt-4", "gpt-3.5-turbo"]:
                    print("Falling back to Gemini")
                    
                    # Use default API key for fallback
                    genai.configure(api_key=self.gemini_api_key)
                    model = genai.GenerativeModel('gemini-pro')
                    
                    response = await model.generate_content_async(full_prompt)
                    response_text = response.text
                    
                    # Estimate completion tokens
                    completion_tokens = self._estimate_tokens(response_text)
                    
                    # Log usage with fallback info
                    await self._log_usage(
                        user_id=user_id,
                        model="gemini-pro (fallback)",
                        prompt_tokens=prompt_tokens,
                        completion_tokens=completion_tokens,
                        latency_ms=int((time.time() - start_time) * 1000),
                        success=True
                    )
                    
                    return {
                        "responseText": response_text,
                        "modelUsed": "gemini-pro (fallback)",
                        "tokenUsage": {
                            "prompt": prompt_tokens,
                            "completion": completion_tokens,
                            "total": prompt_tokens + completion_tokens
                        }
                    }
                    
                # If Gemini failed, try GPT-3.5
                elif model_preference == "gemini-pro":
                    print("Falling back to GPT-3.5")
                    
                    response = await openai.ChatCompletion.acreate(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": full_prompt}
                        ]
                    )
                    
                    response_text = response.choices[0].message.content
                    prompt_tokens = response.usage.prompt_tokens
                    completion_tokens = response.usage.completion_tokens
                    
                    # Log usage with fallback info
                    await self._log_usage(
                        user_id=user_id,
                        model="gpt-3.5-turbo (fallback)",
                        prompt_tokens=prompt_tokens,
                        completion_tokens=completion_tokens,
                        latency_ms=int((time.time() - start_time) * 1000),
                        success=True
                    )
                    
                    return {
                        "responseText": response_text,
                        "modelUsed": "gpt-3.5-turbo (fallback)",
                        "tokenUsage": {
                            "prompt": prompt_tokens,
                            "completion": completion_tokens,
                            "total": prompt_tokens + completion_tokens
                        }
                    }
            except Exception as fallback_error:
                print(f"Fallback also failed: {fallback_error}")
                
                # Log the failure
                await self._log_usage(
                    user_id=user_id,
                    model=f"{model_preference} (failed)",
                    prompt_tokens=prompt_tokens,
                    completion_tokens=0,
                    latency_ms=int((time.time() - start_time) * 1000),
                    success=False,
                    error_message=str(fallback_error)
                )
                
                # Return a graceful error message
                return {
                    "responseText": "I'm sorry, but I encountered an issue processing your request. Please try again later.",
                    "modelUsed": "error-fallback",
                    "tokenUsage": {
                        "prompt": prompt_tokens,
                        "completion": 0,
                        "total": prompt_tokens
                    }
                }

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
        
    async def test_api_key(self, provider: str, key: str) -> bool:
        """Test if an API key is valid"""
        try:
            if provider == "openai":
                # Create a temporary client with the provided key
                client = openai.OpenAI(api_key=key)
                
                # Make a simple request
                response = await client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": "Hello, this is a test."}
                    ],
                    max_tokens=5
                )
                
                return True
                
            elif provider == "gemini":
                # Configure with the provided key
                temp_genai = genai.configure(api_key=key)
                
                # Make a simple request
                model = genai.GenerativeModel('gemini-pro')
                response = await model.generate_content_async("Hello, this is a test.")
                
                return True
                
            elif provider == "claude":
                # Claude implementation would go here
                # For now, just return False
                return False
                
            return False
        except Exception as e:
            print(f"API key test failed for {provider}: {e}")
            return False

    def _requires_advanced_reasoning(self, prompt: str) -> bool:
        """Determine if a prompt requires advanced reasoning capabilities"""
        # Check for keywords that suggest complex reasoning
        complex_patterns = [
            r"code|program|function|algorithm|debug",
            r"explain in detail|complex|complicated|analyze|compare and contrast",
            r"math|equation|calculate|formula|proof",
            r"logical|reasoning|philosophy|ethics|argument",
            r"step by step|breakdown|how would you|implement"
        ]
        
        import re
        for pattern in complex_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                return True
                
        return False

    def _is_low_quality_response(self, text: str) -> bool:
        """Check if a response is too generic or short"""
        # Check if response is too short
        if len(text.split()) < 30:
            return True
            
        # Check for generic uncertainty phrases
        generic_phrases = [
            "I'm not sure",
            "I don't know",
            "I cannot provide",
            "I'm unable to",
            "I don't have enough information",
            "It's unclear",
            "I cannot determine"
        ]
        
        for phrase in generic_phrases:
            if phrase.lower() in text.lower():
                return True
                
        return False

    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count for a text string"""
        # Rough estimate: 1 token ≈ 4 characters for English text
        return max(1, len(text) // 4)

    async def _log_usage(
        self,
        user_id: Optional[str],
        model: str,
        prompt_tokens: int,
        completion_tokens: int,
        latency_ms: int,
        success: bool,
        error_message: Optional[str] = None
    ) -> None:
        """Log LLM usage to database"""
        try:
            # In a real implementation, this would be stored in a database table
            usage_log = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "model_used": model,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens,
                "latency_ms": latency_ms,
                "success": success,
                "error_message": error_message,
                "timestamp": datetime.now()
            }
            
            # For demo purposes, just print the usage log
            print(f"LLM usage log: {usage_log}")
            
        except Exception as e:
            print(f"Error logging LLM usage: {e}")