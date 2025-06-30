from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from ..middleware.auth import get_current_user
from ..services.database_service import DatabaseService
from ..services.cache_service import CacheService

router = APIRouter()
db_service = DatabaseService()
cache_service = CacheService()

@router.get("/threads/{thread_id}/chunks")
async def get_thread_chunks_paginated(
    thread_id: str,
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    current_user = Depends(get_current_user)
):
    """Get thread chunks with pagination"""
    try:
        # Check cache first
        cache_key = f"thread_chunks:{thread_id}:page_{page}:limit_{limit}"
        cached_result = await cache_service.get(cache_key)
        if cached_result:
            return cached_result
        
        conn = await db_service.get_connection()
        
        if conn:
            try:
                # Verify thread ownership
                thread = await conn.fetchrow('''
                    SELECT id, user_id FROM threads WHERE id = $1
                ''', thread_id)
                
                if not thread:
                    raise HTTPException(status_code=404, detail="Thread not found")
                
                if thread['user_id'] != current_user.get('id'):
                    raise HTTPException(status_code=403, detail="Not authorized")
                
                # Calculate offset
                offset = (page - 1) * limit
                
                # Get total count
                total_count = await conn.fetchval('''
                    SELECT COUNT(*) FROM chunks WHERE thread_id = $1
                ''', thread_id)
                
                # Get paginated chunks
                chunks = await conn.fetch('''
                    SELECT c.*, s.title as source_title, s.type as source_type
                    FROM chunks c
                    LEFT JOIN sources s ON c.source_id = s.id
                    WHERE c.thread_id = $1
                    ORDER BY c.timestamp
                    LIMIT $2 OFFSET $3
                ''', thread_id, limit, offset)
                
                # Calculate pagination info
                total_pages = (total_count + limit - 1) // limit
                has_next = page < total_pages
                has_prev = page > 1
                
                result = {
                    "chunks": [dict(chunk) for chunk in chunks],
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total_count": total_count,
                        "total_pages": total_pages,
                        "has_next": has_next,
                        "has_prev": has_prev
                    }
                }
                
                # Cache for 30 minutes
                await cache_service.set(cache_key, result, ttl=1800)
                
                return result
                
            finally:
                await db_service.release_connection(conn)
        else:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sources/{source_id}/chunks")
async def get_source_chunks_paginated(
    source_id: str,
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    current_user = Depends(get_current_user)
):
    """Get source chunks with pagination"""
    try:
        # Check cache first
        cache_key = f"source_chunks:{source_id}:page_{page}:limit_{limit}"
        cached_result = await cache_service.get(cache_key)
        if cached_result:
            return cached_result
        
        conn = await db_service.get_connection()
        
        if conn:
            try:
                # Verify source ownership
                source = await conn.fetchrow('''
                    SELECT id, user_id FROM sources WHERE id = $1
                ''', source_id)
                
                if not source:
                    raise HTTPException(status_code=404, detail="Source not found")
                
                if source['user_id'] != current_user.get('id'):
                    raise HTTPException(status_code=403, detail="Not authorized")
                
                # Calculate offset
                offset = (page - 1) * limit
                
                # Get total count
                total_count = await conn.fetchval('''
                    SELECT COUNT(*) FROM chunks WHERE source_id = $1
                ''', source_id)
                
                # Get paginated chunks
                chunks = await conn.fetch('''
                    SELECT * FROM chunks 
                    WHERE source_id = $1
                    ORDER BY timestamp
                    LIMIT $2 OFFSET $3
                ''', source_id, limit, offset)
                
                # Calculate pagination info
                total_pages = (total_count + limit - 1) // limit
                has_next = page < total_pages
                has_prev = page > 1
                
                result = {
                    "chunks": [dict(chunk) for chunk in chunks],
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total_count": total_count,
                        "total_pages": total_pages,
                        "has_next": has_next,
                        "has_prev": has_prev
                    }
                }
                
                # Cache for 30 minutes
                await cache_service.set(cache_key, result, ttl=1800)
                
                return result
                
            finally:
                await db_service.release_connection(conn)
        else:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/paginated")
async def search_with_pagination(
    q: str = Query(..., description="Search query"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    limit: int = Query(20, ge=1, le=50, description="Items per page"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Similarity threshold"),
    current_user = Depends(get_current_user)
):
    """Search with pagination support"""
    try:
        # Check cache first
        cache_key = f"search_paginated:{q}:page_{page}:limit_{limit}:threshold_{threshold}"
        cached_result = await cache_service.get(cache_key)
        if cached_result:
            return cached_result
        
        conn = await db_service.get_connection()
        
        if conn:
            try:
                # Calculate offset
                offset = (page - 1) * limit
                
                # For now, use text search (in production, you'd use vector search)
                total_count = await conn.fetchval('''
                    SELECT COUNT(*)
                    FROM chunks c
                    JOIN sources s ON c.source_id = s.id
                    WHERE s.user_id = $1 AND c.search_vector @@ plainto_tsquery('english', $2)
                ''', current_user.get('id'), q)
                
                # Get paginated results
                results = await conn.fetch('''
                    SELECT c.*, s.title as source_title, s.type as source_type,
                           ts_rank(c.search_vector, plainto_tsquery('english', $2)) as rank
                    FROM chunks c
                    JOIN sources s ON c.source_id = s.id
                    WHERE s.user_id = $1 AND c.search_vector @@ plainto_tsquery('english', $2)
                    ORDER BY rank DESC
                    LIMIT $3 OFFSET $4
                ''', current_user.get('id'), q, limit, offset)
                
                # Calculate pagination info
                total_pages = (total_count + limit - 1) // limit
                has_next = page < total_pages
                has_prev = page > 1
                
                result = {
                    "query": q,
                    "results": [dict(row) for row in results],
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total_count": total_count,
                        "total_pages": total_pages,
                        "has_next": has_next,
                        "has_prev": has_prev
                    }
                }
                
                # Cache for 15 minutes
                await cache_service.set(cache_key, result, ttl=900)
                
                return result
                
            finally:
                await db_service.release_connection(conn)
        else:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))