import redis
import json
import hashlib
from typing import Optional, Any, Dict, List
import os
from datetime import timedelta

class CacheService:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        try:
            self.redis = redis.from_url(redis_url, decode_responses=True)
            # Test connection
            self.redis.ping()
            self.enabled = True
        except Exception as e:
            print(f"Redis connection failed: {e}")
            self.redis = None
            self.enabled = False

    def _generate_key(self, prefix: str, identifier: str) -> str:
        """Generate a cache key with prefix and hashed identifier"""
        hash_id = hashlib.md5(identifier.encode()).hexdigest()
        return f"knitchat:{prefix}:{hash_id}"

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.enabled:
            return None
        
        try:
            value = self.redis.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL"""
        if not self.enabled:
            return False
        
        try:
            serialized = json.dumps(value, default=str)
            return self.redis.setex(key, ttl, serialized)
        except Exception as e:
            print(f"Cache set error: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.enabled:
            return False
        
        try:
            return bool(self.redis.delete(key))
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False

    async def get_search_results(self, query: str, filters: Dict = None) -> Optional[List]:
        """Get cached search results"""
        cache_key = self._generate_key("search", f"{query}:{json.dumps(filters or {}, sort_keys=True)}")
        return await self.get(cache_key)

    async def cache_search_results(self, query: str, filters: Dict, results: List, ttl: int = 1800) -> bool:
        """Cache search results for 30 minutes"""
        cache_key = self._generate_key("search", f"{query}:{json.dumps(filters or {}, sort_keys=True)}")
        return await self.set(cache_key, results, ttl)

    async def get_thread(self, thread_id: str) -> Optional[Dict]:
        """Get cached thread data"""
        cache_key = self._generate_key("thread", thread_id)
        return await self.get(cache_key)

    async def cache_thread(self, thread_id: str, thread_data: Dict, ttl: int = 3600) -> bool:
        """Cache thread data for 1 hour"""
        cache_key = self._generate_key("thread", thread_id)
        return await self.set(cache_key, thread_data, ttl)

    async def invalidate_thread(self, thread_id: str) -> bool:
        """Invalidate thread cache"""
        cache_key = self._generate_key("thread", thread_id)
        return await self.delete(cache_key)

    async def get_conversation(self, source_id: str) -> Optional[Dict]:
        """Get cached conversation data"""
        cache_key = self._generate_key("conversation", source_id)
        return await self.get(cache_key)

    async def cache_conversation(self, source_id: str, conversation_data: Dict, ttl: int = 3600) -> bool:
        """Cache conversation data for 1 hour"""
        cache_key = self._generate_key("conversation", source_id)
        return await self.set(cache_key, conversation_data, ttl)

    async def get_embeddings(self, text_hash: str) -> Optional[List[float]]:
        """Get cached embeddings"""
        cache_key = self._generate_key("embedding", text_hash)
        return await self.get(cache_key)

    async def cache_embeddings(self, text_hash: str, embeddings: List[float], ttl: int = 86400) -> bool:
        """Cache embeddings for 24 hours"""
        cache_key = self._generate_key("embedding", text_hash)
        return await self.set(cache_key, embeddings, ttl)

    async def clear_user_cache(self, user_id: str) -> bool:
        """Clear all cache entries for a user"""
        if not self.enabled:
            return False
        
        try:
            pattern = f"knitchat:*:{user_id}*"
            keys = self.redis.keys(pattern)
            if keys:
                return bool(self.redis.delete(*keys))
            return True
        except Exception as e:
            print(f"Cache clear error: {e}")
            return False