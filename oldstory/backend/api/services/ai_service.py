from typing import Optional
import os
import google.generativeai as genai

class AIService:
    def __init__(self):
        # Configure the Gemini API key
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set.")
        genai.configure(api_key=gemini_api_key)
        self.model = genai.GenerativeModel('gemini-2.5-pro')

    async def get_gemini_response(self, prompt: str) -> Optional[str]:
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error getting Gemini response: {e}")
            return None
