import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import numpy as np
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseService:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        if not self._initialized:
            # Initialize Supabase client
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env")
            self.supabase: Client = create_client(supabase_url, supabase_key)
            # Always define in-memory fallback stores
            self.sources = {}
            self.chunks = {}
            self.threads = {}
            self.micro_threads = {}
            self._initialized = True
    
    async def get_connection(self):
        """Get a database connection from Supabase"""
        if not hasattr(self, 'supabase') or not self.supabase:
            raise RuntimeError("Supabase client not initialized")
        return self.supabase

    async def release_connection(self, conn):
        """Release a connection back to the pool"""
        # No-op since we're using Supabase client
        if self.pool and conn:
            await self.pool.release(conn)

    async def create_source(self, source_data: Dict[str, Any]) -> str:
        """Create a new source using Supabase client. Expects standardized high-level type and metadata.import_method."""
        source_id = source_data["id"]
        try:
            # Supabase expects metadata as a dict, not JSON string
            data = source_data.copy()
            if isinstance(data.get("metadata"), str):
                try:
                    data["metadata"] = json.loads(data["metadata"])
                except Exception:
                    data["metadata"] = {}
            # Ensure import_method is always present in metadata
            if "metadata" not in data or not isinstance(data["metadata"], dict):
                data["metadata"] = {"import_method": "manual"}
            elif "import_method" not in data["metadata"]:
                data["metadata"]["import_method"] = "manual"
            # Convert all datetime objects to isoformat strings for Supabase
            for k, v in data.items():
                if isinstance(v, datetime):
                    data[k] = v.isoformat()
            result = self.supabase.table('sources').insert(data).execute()
            if hasattr(result, 'error') and result.error:
                print(f"Database error creating source: {result.error}")
        except Exception as e:
            print(f"Database error creating source: {e}")
            # Fallback to in-memory
            self.sources[source_id] = source_data
        return source_id

    async def get_source(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Get source by ID (Supabase only)"""
        try:
            result = self.supabase.table('sources').select('*').eq('id', source_id).execute()
            data = result.data[0] if result.data else None
            return data
        except Exception as e:
            print(f"Database error getting source: {e}")
            return self.sources.get(source_id)

    async def create_chunk(self, chunk_data: Dict[str, Any]) -> str:
        """Create a new chunk using Supabase client"""
        chunk_id = chunk_data["id"]
        try:
            data = chunk_data.copy()
            if isinstance(data.get("metadata"), str):
                try:
                    data["metadata"] = json.loads(data["metadata"])
                except Exception:
                    data["metadata"] = {}
            # Convert all datetime objects to isoformat strings for Supabase
            for k, v in data.items():
                if isinstance(v, datetime):
                    data[k] = v.isoformat()
            result = self.supabase.table('chunks').insert(data).execute()
            if hasattr(result, 'error') and result.error:
                print(f"Database error creating chunk: {result.error}")
        except Exception as e:
            print(f"Database error creating chunk: {e}")
            # Fallback to in-memory
            self.chunks[chunk_id] = chunk_data
        return chunk_id

    async def get_chunk(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Get chunk by ID (Supabase only)"""
        try:
            result = self.supabase.table('chunks').select('*').eq('id', chunk_id).execute()
            data = result.data[0] if result.data else None
            return data
        except Exception as e:
            print(f"Database error getting chunk: {e}")
            return self.chunks.get(chunk_id)

    async def get_chunks_by_source(self, source_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a source (Supabase only)"""
        try:
            result = self.supabase.table('chunks').select('*').eq('source_id', source_id).order('timestamp', desc=False).execute()
            return result.data or []
        except Exception as e:
            print(f"Database error getting chunks: {e}")
            return [chunk for chunk in self.chunks.values() if chunk["source_id"] == source_id]

    async def count_chunks_by_source(self, source_id: str) -> int:
        """Count chunks for a source (Supabase only)"""
        try:
            result = self.supabase.table('chunks').select('id', count='exact').eq('source_id', source_id).execute()
            return result.count if hasattr(result, 'count') and result.count is not None else 0
        except Exception as e:
            print(f"Database error counting chunks: {e}")
            return 0
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
        
    async def get_micro_threads_by_parent_thread(self, parent_thread_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get all micro-threads for a parent thread"""
        conn = await self.get_connection()
        
        if conn:
            try:
                rows = await conn.fetch('''
                    SELECT * FROM micro_threads 
                    WHERE parent_thread_id = $1
                    ORDER BY created_at DESC
                    LIMIT $2 OFFSET $3
                ''', parent_thread_id, limit, offset)
                
                return [dict(row) for row in rows]
            except Exception as e:
                print(f"Database error getting micro-threads by parent thread: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory
        all_threads = [mt for mt in self.micro_threads.values() 
                      if mt.get("parent_thread_id") == parent_thread_id]
        sorted_threads = sorted(all_threads, key=lambda x: x.get("created_at", datetime.now()), reverse=True)
        return sorted_threads[offset:offset+limit]
        
    async def get_micro_thread_by_id(self, micro_thread_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific micro-thread by ID"""
        conn = await self.get_connection()
        
        if conn:
            try:
                row = await conn.fetchrow('''
                    SELECT * FROM micro_threads 
                    WHERE id = $1
                ''', micro_thread_id)
                
                if row:
                    return dict(row)
                return None
            except Exception as e:
                print(f"Database error getting micro-thread by id: {e}")
            finally:
                await self.release_connection(conn)
        
        # Fallback to in-memory
        return self.micro_threads.get(micro_thread_id)
        
    async def list_imported_chats(self, limit: int = 50, offset: int = 0, source_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all imported chats with pagination and optional filtering.
        Supports both high-level (e.g., 'chatgpt') and specific (e.g., 'chatgpt-link') source types.
        """
        print(f"[DEBUG] list_imported_chats called with limit={limit}, offset={offset}, source_type={source_type}")
        
        try:
            # Query the sources table in Supabase
            query = self.supabase.table('sources').select('*')
            
            # Apply source type filter if provided
            if source_type:
                print(f"[DEBUG] Filtering by source_type: {source_type}")
                
                # Special handling for hybrid chats
                if source_type.lower() == 'hybrid':
                    query = query.eq("metadata->>is_hybrid", True).or_("metadata->>import_method.eq.hybrid-merge")
                # Special handling for chatgpt to include both 'chatgpt' and 'chatgpt-link'
                elif source_type.lower() == 'chatgpt':
                    query = query.or_(
                        "type.eq.chatgpt," 
                        "metadata->>import_method.eq.chatgpt," 
                        "metadata->>import_method.eq.chatgpt-link"
                    )
                # Standard filtering for other types
                else:
                    query = query.or_(
                        f"type.eq.{source_type},"
                        f"metadata->>import_method.eq.{source_type},"
                        f"metadata->>source_type.eq.{source_type}"
                    )
            
            # Apply ordering
            query = query.order('created_at', desc=True)
            
            # Apply pagination
            result = query.range(offset, offset + limit - 1).execute()
            
            # Get total count for reference
            count_query = self.supabase.table('sources').select('*', count='exact')
            if source_type:
                count_query = count_query.or_(f"type.eq.{source_type},metadata->>import_method.eq.{source_type}")
                if source_type == 'chatgpt':
                    count_query = count_query.or_("type.eq.chatgpt,metadata->>import_method.eq.chatgpt,metadata->>import_method.eq.chatgpt-link")
            
            total_count = count_query.execute().count or 0
            print(f"[DEBUG] Found {total_count} total sources (filtered: {bool(source_type)})")
            
            # For each source, get the chunk count
            chats = []
            for source in result.data:
                # Get chunk count for this source
                chunk_count = await self._get_chunk_count_for_source(source['id'])
                
                # Ensure metadata has the right structure
                meta = source.get("metadata", {}) or {}
                if not isinstance(meta, dict):
                    meta = {"import_method": "manual", "original_metadata": meta}
                elif "import_method" not in meta:
                    meta["import_method"] = "manual"
                
                # Determine the source type value with priority:
                # 1. metadata.import_method (most specific)
                # 2. source.type (from database)
                # 3. metadata.source_type (legacy)
                # 4. 'unknown' (fallback)
                source_type_value = (
                    meta.get("import_method") or 
                    source.get("type") or 
                    meta.get("source_type") or 
                    "unknown"
                )
                
                # For hybrid chats, ensure we use the correct display type
                if meta.get("is_hybrid") or meta.get("import_method") == "hybrid-merge":
                    source_type_value = "hybrid"
                
                chats.append({
                    "id": source["id"],
                    "title": source.get("title", "Untitled"),
                    "sourceType": source_type_value or "unknown",
                    "importDate": source.get("created_at"),
                    "chunkCount": chunk_count,
                    "metadata": meta
                })
            
            return chats
            
        except Exception as e:
            print(f"Error getting imported chats from Supabase: {e}")
            raise
    
    async def _get_chunk_count_for_source(self, source_id: str) -> int:
        """Helper method to get chunk count for a source"""
        try:
            result = (self.supabase.table('chunks')
                    .select('id', count='exact')
                    .eq('source_id', source_id)
                    .execute())
            return result.count if hasattr(result, 'count') else 0
        except Exception as e:
            print(f"Error getting chunk count for source {source_id}: {e}")
            return 0

    # Message operations
    async def list_messages(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """List all main chat messages"""
        try:
            result = (self.supabase.table('messages')
                      .select('*')
                      .order('timestamp', desc=True)
                      .range(offset, offset + limit - 1)
                      .execute())
            return result.data or []
        except Exception as e:
            print(f"Error listing messages: {e}")
            return []

    async def get_message(self, message_id: str) -> Optional[Dict[str, Any]]:
        """Get a single message by ID"""
        try:
            result = (self.supabase.table('messages')
                      .select('*')
                      .eq('id', message_id)
                      .single()
                      .execute())
            return result.data
        except Exception as e:
            print(f"Error getting message {message_id}: {e}")
            return None

    async def create_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new main chat message"""
        # Convert datetime to ISO string if present
        data = message_data.copy()
        for k, v in data.items():
            if isinstance(v, datetime):
                data[k] = v.isoformat()
        try:
            result = self.supabase.table('messages').insert(data).execute()
            return result.data[0]
        except Exception as e:
            print(f"Error creating message: {e}")
            raise

        """Helper method to get chunk count for a source"""
        try:
            result = (self.supabase.table('chunks')
                    .select('id', count='exact')
                    .eq('source_id', source_id)
                    .execute())
            return result.count if hasattr(result, 'count') else 0
        except Exception as e:
            print(f"Error getting chunk count for source {source_id}: {e}")
            return 0