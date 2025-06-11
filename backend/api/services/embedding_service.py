import os
import asyncio
from typing import List
import openai
import numpy as np
import json
import hashlib
import aiofiles
import os.path

class EmbeddingService:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.cache_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'cache')
        os.makedirs(self.cache_dir, exist_ok=True)

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for given text using OpenAI"""
        # Check cache first
        cache_key = self._get_cache_key(text)
        cached_embedding = await self._get_cached_embedding(cache_key)
        if cached_embedding:
            return cached_embedding
        
        try:
            response = await openai.Embedding.acreate(
                model="text-embedding-ada-002",
                input=text
            )
            embedding = response.data[0].embedding
            
            # Cache the embedding
            await self._cache_embedding(cache_key, embedding)
            
            return embedding
        except Exception as e:
            print(f"Embedding generation error: {e}")
            # Return a dummy embedding for demo purposes
            return [0.0] * 1536

    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        embeddings = []
        for text in texts:
            embedding = await self.generate_embedding(text)
            embeddings.append(embedding)
        return embeddings

    def cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        a_np = np.array(a)
        b_np = np.array(b)
        
        dot_product = np.dot(a_np, b_np)
        norm_a = np.linalg.norm(a_np)
        norm_b = np.linalg.norm(b_np)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return dot_product / (norm_a * norm_b)

    async def find_similar_chunks(
        self, 
        query_embedding: List[float], 
        chunk_embeddings: List[List[float]], 
        threshold: float = 0.7
    ) -> List[int]:
        """Find chunks similar to query based on embedding similarity"""
        similarities = []
        for i, chunk_embedding in enumerate(chunk_embeddings):
            similarity = self.cosine_similarity(query_embedding, chunk_embedding)
            if similarity >= threshold:
                similarities.append((i, similarity))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [i for i, _ in similarities]
    
    def _get_cache_key(self, text: str) -> str:
        """Generate a cache key for a text"""
        # Use a hash of the text as the cache key
        return hashlib.md5(text.encode('utf-8')).hexdigest()
    
    async def _get_cached_embedding(self, cache_key: str) -> List[float]:
        """Get embedding from cache if it exists"""
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        if os.path.exists(cache_file):
            try:
                async with aiofiles.open(cache_file, 'r') as f:
                    content = await f.read()
                    return json.loads(content)
            except Exception as e:
                print(f"Error reading from cache: {e}")
        return None
    
    async def _cache_embedding(self, cache_key: str, embedding: List[float]) -> None:
        """Cache an embedding"""
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        try:
            async with aiofiles.open(cache_file, 'w') as f:
                await f.write(json.dumps(embedding))
        except Exception as e:
            print(f"Error writing to cache: {e}")