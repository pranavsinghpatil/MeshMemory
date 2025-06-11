import os
import asyncio
from typing import List
import openai
import numpy as np

class EmbeddingService:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for given text using OpenAI"""
        try:
            response = await openai.Embedding.acreate(
                model="text-embedding-ada-002",
                input=text
            )
            return response.data[0].embedding
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