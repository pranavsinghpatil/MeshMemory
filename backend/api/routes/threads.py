from fastapi import APIRouter, HTTPException, Path, Query, Body
from typing import List, Optional
from ..models.schemas import ThreadResponse, ThreadSummary, MergeThreadRequest, SplitThreadRequest
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

<<<<<<< HEAD
@router.get("/threads/{thread_id}/summary")
async def get_thread_summary(
    thread_id: str = Path(..., description="Thread ID"),
    regenerate: bool = Query(False, description="Force regenerate summary")
):
    """
    Get or generate thread summary
    """
    try:
        summary = await thread_service.get_or_generate_summary(thread_id, regenerate)
        
        if not summary:
            raise HTTPException(status_code=404, detail="Thread not found or summary could not be generated")
        
        return {
            "threadId": thread_id,
            "summary": summary["summary"],
            "keyTopics": summary.get("key_topics", []),
            "generatedAt": summary["generated_at"],
            "modelUsed": summary.get("model_used"),
            "confidenceScore": summary.get("confidence_score")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/threads/{thread_id}/summary/regenerate")
async def regenerate_thread_summary(thread_id: str = Path(..., description="Thread ID")):
    """
    Force regenerate thread summary
    """
    try:
        summary = await thread_service.regenerate_summary(thread_id)
        
        return {
            "threadId": thread_id,
            "summary": summary["summary"],
            "keyTopics": summary.get("key_topics", []),
            "generatedAt": summary["generated_at"],
            "modelUsed": summary.get("model_used"),
            "message": "Summary regenerated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

=======
>>>>>>> 25a3726cc0a1e32f9e3e64bd3ef01ce4a1d1f396
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

@router.post("/threads/{thread_id}/merge")
async def merge_threads(
    thread_id: str,
    request: MergeThreadRequest = Body(...)
):
    """
    Merge two threads together
    """
    try:
        result = await thread_service.merge_threads(thread_id, request.targetThreadId)
        
        return {
            "message": "Threads merged successfully",
            "threadId": result["thread_id"],
            "title": result["title"],
            "chunkCount": result["chunk_count"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/threads/{thread_id}/split")
async def split_thread(
    thread_id: str,
    request: SplitThreadRequest = Body(...)
):
    """
    Split a thread at a specific chunk
    """
    try:
        result = await thread_service.split_thread(thread_id, request.chunkId)
        
        return {
            "message": "Thread split successfully",
            "originalThreadId": result["original_thread_id"],
            "newThreadId": result["new_thread_id"],
            "newThreadTitle": result["new_thread_title"],
            "chunksInOriginal": result["chunks_in_original"],
            "chunksInNew": result["chunks_in_new"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))