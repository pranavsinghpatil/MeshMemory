from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..models.schemas import MicroThreadRequest, MicroThreadResponse
from ..services.micro_thread_service import MicroThreadService

router = APIRouter()
micro_thread_service = MicroThreadService()

@router.post("/thread", response_model=MicroThreadResponse)
async def create_micro_thread(request: MicroThreadRequest):
    """
    Create a micro-thread (follow-up conversation)
    """
    try:
        result = await micro_thread_service.create_micro_thread(
            chunk_id=request.chunkId,
            question=request.question,
            context=request.context
        )
        
        return MicroThreadResponse(
            threadId=result["thread_id"],
            answer=result["answer"],
            modelUsed=result["model_used"],
            timestamp=result["timestamp"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/thread/{chunk_id}/micro-threads")
async def get_micro_threads_for_chunk(chunk_id: str):
    """
    Get all micro-threads for a specific chunk
    """
    try:
        micro_threads = await micro_thread_service.get_micro_threads_by_chunk(chunk_id)
        return {"microThreads": micro_threads}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))