import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

# Mock database service for demo purposes
# In production, this would connect to your actual database (Supabase, PostgreSQL, etc.)

class DatabaseService:
    def __init__(self):
        # In-memory storage for demo
        self.sources = {}
        self.chunks = {}
        self.threads = {}
        self.micro_threads = {}

    async def create_source(self, source_data: Dict[str, Any]) -> str:
        """Create a new source"""
        source_id = source_data["id"]
        self.sources[source_id] = source_data
        return source_id

    async def get_source(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Get source by ID"""
        return self.sources.get(source_id)

    async def create_chunk(self, chunk_data: Dict[str, Any]) -> str:
        """Create a new chunk"""
        chunk_id = chunk_data["id"]
        self.chunks[chunk_id] = chunk_data
        return chunk_id

    async def get_chunks_by_source(self, source_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a source"""
        return [chunk for chunk in self.chunks.values() if chunk["source_id"] == source_id]

    async def count_chunks_by_source(self, source_id: str) -> int:
        """Count chunks for a source"""
        return len([chunk for chunk in self.chunks.values() if chunk["source_id"] == source_id])

    async def search_chunks_by_embedding(
        self, 
        query_embedding: List[float], 
        threshold: float = 0.7, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search chunks by embedding similarity"""
        # For demo purposes, return some mock results
        # In production, this would use vector similarity search
        results = []
        for chunk in list(self.chunks.values())[:limit]:
            # Mock similarity score
            similarity = 0.85 if "React" in chunk["text_chunk"] else 0.75
            if similarity >= threshold:
                result = chunk.copy()
                result["similarity"] = similarity
                results.append(result)
        
        return sorted(results, key=lambda x: x["similarity"], reverse=True)

    async def create_thread(self, thread_data: Dict[str, Any]) -> str:
        """Create a new thread"""
        thread_id = thread_data["id"]
        self.threads[thread_id] = thread_data
        return thread_id

    async def get_all_threads(self) -> List[Dict[str, Any]]:
        """Get all threads"""
        return list(self.threads.values())

    async def get_thread(self, thread_id: str) -> Optional[Dict[str, Any]]:
        """Get thread by ID"""
        return self.threads.get(thread_id)

    async def create_micro_thread(self, micro_thread_data: Dict[str, Any]) -> str:
        """Create a new micro-thread"""
        micro_thread_id = micro_thread_data["id"]
        self.micro_threads[micro_thread_id] = micro_thread_data
        return micro_thread_id

    async def get_micro_threads_by_chunk(self, chunk_id: str) -> List[Dict[str, Any]]:
        """Get micro-threads for a chunk"""
        return [mt for mt in self.micro_threads.values() if mt["parent_chunk_id"] == chunk_id]