from typing import List, Dict, Any
import asyncio
import os
import json
from .database_service import DatabaseService
from .embedding_service import EmbeddingService
from .llm_service import LLMService
import redis
import pickle

class SearchService:
    def __init__(self):
        self.db_service = DatabaseService()
        self.embedding_service = EmbeddingService()
        self.llm_service = LLMService()
        
        # Initialize Redis for caching if available
        redis_url = os.getenv("REDIS_URL")
        self.cache = None
        if redis_url:
            try:
                self.cache = redis.from_url(redis_url)
                print("Redis cache initialized for search service")
            except Exception as e:
                print(f"Failed to initialize Redis cache: {e}")

    async def semantic_search(
        self, 
        query: str, 
        limit: int = 10, 
        threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Perform semantic search across all chunks"""
        
        # Check cache first if available
        if self.cache:
            cache_key = f"search:{query}:{limit}:{threshold}"
            cached_result = self.cache.get(cache_key)
            if cached_result:
                try:
                    return pickle.loads(cached_result)
                except Exception:
                    # If unpickling fails, continue with normal search
                    pass
        
        # Generate embedding for query
        query_embedding = await self.embedding_service.generate_embedding(query)
        
        # Search for similar chunks using vector similarity
        similar_chunks = await self.db_service.search_chunks_by_embedding(
            query_embedding, threshold, limit
        )
        
        # Enrich results with source information
        enriched_results = []
        for chunk in similar_chunks:
            source = await self.db_service.get_source(chunk["source_id"])
            
            result = {
                "id": chunk["id"],
                "text_chunk": chunk["text_chunk"],
                "similarity": chunk["similarity"],
                "source": {
                    "id": source["id"] if source else None,
                    "title": source["title"] if source else "Unknown",
                    "type": source["type"] if source else "unknown",
                    "created_at": source["created_at"] if source else None,
                    "url": source.get("url")
                },
                "participant_label": chunk.get("participant_label"),
                "timestamp": chunk["timestamp"]
            }
            enriched_results.append(result)
        
        # Cache the results if Redis is available
        if self.cache:
            try:
                self.cache.setex(
                    cache_key,
                    3600,  # Cache for 1 hour
                    pickle.dumps(enriched_results)
                )
            except Exception as e:
                print(f"Failed to cache search results: {e}")
        
        return enriched_results

    async def generate_ai_response(self, query: str, search_results: List[Dict[str, Any]]) -> str:
        """Generate AI response based on search results"""
        if not search_results:
            return "I couldn't find any relevant information in your conversations."
        
        # Prepare context from search results
        context_parts = []
        for i, result in enumerate(search_results[:3]):  # Use top 3 results
            source_info = f"Source: {result['source']['title']}"
            if result.get('participant_label'):
                source_info += f" (from {result['participant_label']})"
            
            context_parts.append(f"[Result {i+1}] {source_info}\n{result['text_chunk']}")
        
        context = "\n\n".join(context_parts)
        
        # Generate response using LLM
        prompt = f"""Based on the following excerpts from the user's previous conversations, 
        please answer their question: "{query}"
        
        {context}
        
        Answer the question based only on the information provided above. If the information 
        doesn't contain a clear answer, acknowledge that and provide the most relevant information 
        you can find in the context. Reference which result(s) you're drawing from in your answer.
        """
        
        response = await self.llm_service.route_to_llm(
            prompt=prompt,
            system_prompt="You are a helpful assistant that answers questions based on the user's previous AI conversations. Be concise and reference the context when relevant."
        )
        
        return response["responseText"]

    async def get_suggestions(self, partial_query: str, limit: int = 5) -> List[str]:
        """Get search suggestions based on partial query"""
        # For demo purposes, return some static suggestions
        # In production, this could be based on previous searches or common topics
        suggestions = [
            "What did I learn about React?",
            "Show me discussions about AI",
            "Find conversations about productivity",
            "What advice did I get about career?",
            "JavaScript best practices"
        ]
        
        # Filter suggestions based on partial query
        filtered = [s for s in suggestions if partial_query.lower() in s.lower()]
        return filtered[:limit]