from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from ..middleware.auth import get_current_user
from ..services.database_service import DatabaseService
from ..services.cache_service import CacheService

router = APIRouter()
db_service = DatabaseService()
cache_service = CacheService()

@router.delete("/sources/{source_id}")
async def delete_source(
    source_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a source and all related data (cascading)"""
    try:
        conn = await db_service.get_connection()
        
        if conn:
            try:
                # Verify ownership
                source = await conn.fetchrow('''
                    SELECT id, user_id FROM sources WHERE id = $1
                ''', source_id)
                
                if not source:
                    raise HTTPException(status_code=404, detail="Source not found")
                
                if source['user_id'] != current_user.id:
                    raise HTTPException(status_code=403, detail="Not authorized to delete this source")
                
                # Delete in correct order to respect foreign key constraints
                # 1. Delete micro-threads first
                await conn.execute('''
                    DELETE FROM micro_threads 
                    WHERE parent_chunk_id IN (
                        SELECT id FROM chunks WHERE source_id = $1
                    )
                ''', source_id)
                
                # 2. Delete chunks
                await conn.execute('''
                    DELETE FROM chunks WHERE source_id = $1
                ''', source_id)
                
                # 3. Delete conversation summaries
                await conn.execute('''
                    DELETE FROM conversation_summaries WHERE source_id = $1
                ''', source_id)
                
                # 4. Delete the source
                await conn.execute('''
                    DELETE FROM sources WHERE id = $1
                ''', source_id)
                
                # Clear related cache
                await cache_service.delete(f"knitchat:conversation:{source_id}")
                
                return {"message": "Source and all related data deleted successfully"}
                
            finally:
                await db_service.release_connection(conn)
        else:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/threads/{thread_id}")
async def delete_thread(
    thread_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a thread and update related chunks"""
    try:
        conn = await db_service.get_connection()
        
        if conn:
            try:
                # Verify ownership
                thread = await conn.fetchrow('''
                    SELECT id, user_id FROM threads WHERE id = $1
                ''', thread_id)
                
                if not thread:
                    raise HTTPException(status_code=404, detail="Thread not found")
                
                if thread['user_id'] != current_user.id:
                    raise HTTPException(status_code=403, detail="Not authorized to delete this thread")
                
                # Update chunks to remove thread_id (don't delete chunks)
                await conn.execute('''
                    UPDATE chunks SET thread_id = NULL WHERE thread_id = $1
                ''', thread_id)
                
                # Delete thread tags
                await conn.execute('''
                    DELETE FROM thread_tags WHERE thread_id = $1
                ''', thread_id)
                
                # Delete shared threads
                await conn.execute('''
                    DELETE FROM shared_threads WHERE thread_id = $1
                ''', thread_id)
                
                # Delete thread changelog
                await conn.execute('''
                    DELETE FROM thread_changelog WHERE thread_id = $1
                ''', thread_id)
                
                # Delete the thread
                await conn.execute('''
                    DELETE FROM threads WHERE id = $1
                ''', thread_id)
                
                # Clear related cache
                await cache_service.invalidate_thread(thread_id)
                
                return {"message": "Thread deleted successfully"}
                
            finally:
                await db_service.release_connection(conn)
        else:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/user/data")
async def delete_all_user_data(
    current_user = Depends(get_current_user),
    confirm: str = None
):
    """Delete all user data (requires confirmation)"""
    if confirm != "DELETE_ALL_MY_DATA":
        raise HTTPException(
            status_code=400, 
            detail="Confirmation required. Set confirm='DELETE_ALL_MY_DATA'"
        )
    
    try:
        conn = await db_service.get_connection()
        
        if conn:
            try:
                user_id = current_user.id
                
                # Delete in correct order
                await conn.execute('DELETE FROM export_jobs WHERE user_id = $1', user_id)
                await conn.execute('DELETE FROM shared_threads WHERE shared_by = $1', user_id)
                await conn.execute('DELETE FROM search_history WHERE user_id = $1', user_id)
                await conn.execute('DELETE FROM usage_logs WHERE user_id = $1', user_id)
                await conn.execute('DELETE FROM user_settings WHERE user_id = $1', user_id)
                await conn.execute('DELETE FROM user_profiles WHERE user_id = $1', user_id)
                await conn.execute('DELETE FROM micro_threads WHERE user_id = $1', user_id)
                
                # Delete thread-related data
                await conn.execute('''
                    DELETE FROM thread_tags WHERE thread_id IN (
                        SELECT id FROM threads WHERE user_id = $1
                    )
                ''', user_id)
                
                await conn.execute('''
                    DELETE FROM thread_changelog WHERE thread_id IN (
                        SELECT id FROM threads WHERE user_id = $1
                    )
                ''', user_id)
                
                await conn.execute('DELETE FROM threads WHERE user_id = $1', user_id)
                
                # Delete chunks and related data
                await conn.execute('''
                    DELETE FROM conversation_summaries WHERE source_id IN (
                        SELECT id FROM sources WHERE user_id = $1
                    )
                ''', user_id)
                
                await conn.execute('''
                    DELETE FROM chunks WHERE source_id IN (
                        SELECT id FROM sources WHERE user_id = $1
                    )
                ''', user_id)
                
                await conn.execute('DELETE FROM sources WHERE user_id = $1', user_id)
                
                # Clear all user cache
                await cache_service.clear_user_cache(user_id)
                
                return {"message": "All user data deleted successfully"}
                
            finally:
                await db_service.release_connection(conn)
        else:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/data/export")
async def export_user_data(
    current_user = Depends(get_current_user)
):
    """Export all user data"""
    try:
        conn = await db_service.get_connection()
        
        if conn:
            try:
                user_id = current_user.id
                
                # Get all user data
                sources = await conn.fetch('SELECT * FROM sources WHERE user_id = $1', user_id)
                chunks = await conn.fetch('''
                    SELECT c.* FROM chunks c
                    JOIN sources s ON c.source_id = s.id
                    WHERE s.user_id = $1
                ''', user_id)
                threads = await conn.fetch('SELECT * FROM threads WHERE user_id = $1', user_id)
                micro_threads = await conn.fetch('SELECT * FROM micro_threads WHERE user_id = $1', user_id)
                settings = await conn.fetch('SELECT * FROM user_settings WHERE user_id = $1', user_id)
                
                export_data = {
                    "user_id": user_id,
                    "export_date": "now()",
                    "sources": [dict(row) for row in sources],
                    "chunks": [dict(row) for row in chunks],
                    "threads": [dict(row) for row in threads],
                    "micro_threads": [dict(row) for row in micro_threads],
                    "settings": [dict(row) for row in settings]
                }
                
                return export_data
                
            finally:
                await db_service.release_connection(conn)
        else:
            raise HTTPException(status_code=500, detail="Database connection failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))