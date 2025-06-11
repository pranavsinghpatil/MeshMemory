from fastapi import APIRouter, HTTPException, Path, Query
from typing import List, Optional
from ..models.schemas import ThreadResponse, ThreadSummary
from ..services.thread_service import ThreadService

router = APIRouter()
thread_service = ThreadService()

@router.get("/threads", response_model=List[ThreadSummary])
async def get_all_threads():
    """
    Get all conversation threads
    """
    try:
        threads = await thread_service.get_all_threads()
        return threads
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/threads/{thread_id}", response_model=ThreadResponse)
async def get_thread(
    thread_id: str = Path(..., description="Thread ID"),
    include_chunks: bool = Query(True, description="Include chunks in response"),
    include_summary: bool = Query(True, description="Include AI-generated summary")
):
    """
    Get a specific thread with all its chunks
    """
    try:
        thread = await thread_service.get_thread_by_id(
            thread_id, 
            include_chunks=include_chunks,
            include_summary=include_summary
        )
        
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        
        return thread
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/threads/auto-generate")
async def auto_generate_threads():
    """
    Automatically generate threads from unassigned chunks
    """
    try:
        result = await thread_service.auto_generate_threads()
        return {
            "message": "Threads generated successfully",
            "threadsCreated": result["threads_created"],
            "chunksProcessed": result["chunks_processed"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/threads/stats")
async def get_thread_stats():
    """
    Get statistics about threads
    """
    try:
        stats = await thread_service.get_thread_statistics()
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/threads/create")
async def create_thread(
    title: str = Query(..., description="Thread title"),
    chunk_ids: List[str] = Query(..., description="List of chunk IDs to include in thread")
):
    """
    Create a new thread from existing chunks
    """
    try:
        if not chunk_ids:
            raise HTTPException(status_code=400, detail="At least one chunk ID is required")
            
        thread = await thread_service.create_thread(title, chunk_ids)
        return {
            "message": "Thread created successfully",
            "threadId": thread["id"],
            "title": thread["title"],
            "chunkCount": len(chunk_ids)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))