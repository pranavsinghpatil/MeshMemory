import asyncio
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import asyncpg
import numpy as np

class DatabaseService:
    def __init__(self):
        # In production, this would connect to your actual database
        self.pool = None
        self.db_url = os.getenv("DATABASE_URL")
        
        # For demo/fallback, use in-memory storage
        self.sources = {}
        self.chunks = {}
        self.threads = {}
        self.micro_threads = {}
    
    async def get_connection(self):
        """Get a database connection from the pool"""
        if not self.pool and self.db_url:
            try:
                self.pool = await asyncpg.create_pool(self.db_url)
            except Exception as e:
                print(f"Failed to connect to database: {e}")
        
        if self.pool:
            return await self.pool.acquire()
        return None

    async def release_connection(self, conn):
        """Release a connection back to the pool"""
        if self.pool and conn:
            await self.pool.release(conn)

    async def create_source(self, source_data: Dict[str, Any]) -> str:
        """Create a new source"""
        conn = await self.get_connection()
        source_id = source_data["id"]
        
        if conn:
            try:
                await conn.execute('''
                    INSERT INTO sources (id, user_id, type, url, title, created_at, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                ''', source_id, source_data.get("user_id"), source_data["type"], 
                source_data.get("url"), source_data["title"], 
                source_data["created_at"], json.dumps(source_data.get("metadata", {})))
            except Exception as e:
                print(f"Database error creating source: {e}")
            finally:
                await self.release_connection(conn)
        else:
            # Fallback to in-memory
            self.sources[source_id] = source_data
        
        return source_id

    async def get_source(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Get source by ID"""
        conn = await self.get_connection()
        
        if conn:
            try:
                row = await conn.fetchrow('''
                    SELECT * FROM sources WHERE id = $1
                ''', source_id)
                
                if row:
                    return dict(row)
                return None
            except Exception as e:
                print(f"Database error getting source: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory
        return self.sources.get(source_id)

    async def create_chunk(self, chunk_data: Dict[str, Any]) -> str:
        """Create a new chunk"""
        conn = await self.get_connection()
        chunk_id = chunk_data["id"]
        
        if conn:
            try:
                await conn.execute('''
                    INSERT INTO chunks (id, source_id, text_chunk, embedding, timestamp, 
                                       model_name, participant_label, thread_id, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ''', chunk_id, chunk_data["source_id"], chunk_data["text_chunk"],
                chunk_data["embedding"], chunk_data["timestamp"], 
                chunk_data.get("model_name"), chunk_data.get("participant_label"),
                chunk_data.get("thread_id"), json.dumps(chunk_data.get("metadata", {})))
            except Exception as e:
                print(f"Database error creating chunk: {e}")
            finally:
                await self.release_connection(conn)
        else:
            # Fallback to in-memory
            self.chunks[chunk_id] = chunk_data
        
        return chunk_id

    async def get_chunk(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Get chunk by ID"""
        conn = await self.get_connection()
        
        if conn:
            try:
                row = await conn.fetchrow('''
                    SELECT * FROM chunks WHERE id = $1
                ''', chunk_id)
                
                if row:
                    return dict(row)
                return None
            except Exception as e:
                print(f"Database error getting chunk: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory
        return self.chunks.get(chunk_id)

    async def get_chunks_by_source(self, source_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a source"""
        conn = await self.get_connection()
        
        if conn:
            try:
                rows = await conn.fetch('''
                    SELECT * FROM chunks WHERE source_id = $1 ORDER BY timestamp
                ''', source_id)
                
                return [dict(row) for row in rows]
            except Exception as e:
                print(f"Database error getting chunks: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory
        return [chunk for chunk in self.chunks.values() if chunk["source_id"] == source_id]

    async def count_chunks_by_source(self, source_id: str) -> int:
        """Count chunks for a source"""
        conn = await self.get_connection()
        
        if conn:
            try:
                row = await conn.fetchrow('''
                    SELECT COUNT(*) FROM chunks WHERE source_id = $1
                ''', source_id)
                
                return row[0]
            except Exception as e:
                print(f"Database error counting chunks: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory
        return len([chunk for chunk in self.chunks.values() if chunk["source_id"] == source_id])

    async def search_chunks_by_embedding(
        self, 
        query_embedding: List[float], 
        threshold: float = 0.7, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search chunks by embedding similarity"""
        conn = await self.get_connection()
        
        if conn:
            try:
                rows = await conn.fetch('''
                    SELECT c.*, 
                           1 - (c.embedding <=> $1) as similarity
                    FROM chunks c
                    WHERE 1 - (c.embedding <=> $1) > $2
                    ORDER BY c.embedding <=> $1
                    LIMIT $3
                ''', query_embedding, threshold, limit)
                
                results = []
                for row in rows:
                    result = dict(row)
                    results.append(result)
                
                return results
            except Exception as e:
                print(f"Database error searching chunks: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory with mock similarity
        # In a real implementation, we would compute actual cosine similarity
        results = []
        for chunk in list(self.chunks.values())[:limit]:
            # Mock similarity score between 0.7 and 0.95
            import random
            similarity = random.uniform(0.7, 0.95)
            
            if similarity >= threshold:
                result = chunk.copy()
                result["similarity"] = similarity
                results.append(result)
        
        return sorted(results, key=lambda x: x["similarity"], reverse=True)

    async def create_thread(self, thread_data: Dict[str, Any]) -> str:
        """Create a new thread"""
        conn = await self.get_connection()
        thread_id = thread_data["id"]
        
        if conn:
            try:
                await conn.execute('''
                    INSERT INTO threads (id, user_id, title, centroid_embedding, 
                                        created_at, updated_at, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                ''', thread_id, thread_data.get("user_id"), thread_data["title"],
                thread_data.get("centroid_embedding"), thread_data["created_at"],
                thread_data["updated_at"], json.dumps(thread_data.get("metadata", {})))
            except Exception as e:
                print(f"Database error creating thread: {e}")
            finally:
                await self.release_connection(conn)
        else:
            # Fallback to in-memory
            self.threads[thread_id] = thread_data
        
        return thread_id

    async def get_all_threads(self) -> List[Dict[str, Any]]:
        """Get all threads"""
        conn = await self.get_connection()
        
        if conn:
            try:
                rows = await conn.fetch('''
                    SELECT * FROM threads ORDER BY updated_at DESC
                ''')
                
                return [dict(row) for row in rows]
            except Exception as e:
                print(f"Database error getting threads: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory
        return list(self.threads.values())

    async def get_thread(self, thread_id: str) -> Optional[Dict[str, Any]]:
        """Get thread by ID"""
        conn = await self.get_connection()
        
        if conn:
            try:
                row = await conn.fetchrow('''
                    SELECT * FROM threads WHERE id = $1
                ''', thread_id)
                
                if row:
                    return dict(row)
                return None
            except Exception as e:
                print(f"Database error getting thread: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory
        return self.threads.get(thread_id)

    async def create_micro_thread(self, micro_thread_data: Dict[str, Any]) -> str:
        """Create a new micro-thread"""
        conn = await self.get_connection()
        micro_thread_id = micro_thread_data["id"]
        
        if conn:
            try:
                await conn.execute('''
                    INSERT INTO micro_threads (id, parent_chunk_id, user_id, user_prompt, 
                                             assistant_response, model_used, created_at, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ''', micro_thread_id, micro_thread_data["parent_chunk_id"],
                micro_thread_data.get("user_id"), micro_thread_data["user_prompt"],
                micro_thread_data["assistant_response"], micro_thread_data["model_used"],
                micro_thread_data["created_at"], json.dumps(micro_thread_data.get("metadata", {})))
            except Exception as e:
                print(f"Database error creating micro-thread: {e}")
            finally:
                await self.release_connection(conn)
        else:
            # Fallback to in-memory
            self.micro_threads[micro_thread_id] = micro_thread_data
        
        return micro_thread_id

    async def get_micro_threads_by_chunk(self, chunk_id: str) -> List[Dict[str, Any]]:
        """Get micro-threads for a chunk"""
        conn = await self.get_connection()
        
        if conn:
            try:
                rows = await conn.fetch('''
                    SELECT * FROM micro_threads 
                    WHERE parent_chunk_id = $1
                    ORDER BY created_at
                ''', chunk_id)
                
                return [dict(row) for row in rows]
            except Exception as e:
                print(f"Database error getting micro-threads: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory
        return [mt for mt in self.micro_threads.values() if mt["parent_chunk_id"] == chunk_id]