from fastapi import APIRouter, HTTPException, Depends, Path, Query
from typing import List, Optional
from ..models.schemas import ConversationResponse, ChunkResponse
from ..services.conversation_service import ConversationService
from ..services.micro_thread_service import MicroThreadService

router = APIRouter()
conversation_service = ConversationService()
micro_thread_service = MicroThreadService()

@router.get("/conversations/{source_id}", response_model=ConversationResponse)
async def get_conversation(
    source_id: str = Path(..., description="Source ID"),
    include_micro_threads: bool = Query(True, description="Include micro-threads in response")
):
    """
    Get conversation chunks for a specific source with optional micro-threads
    """
    try:
        conversation = await conversation_service.get_conversation_by_source(source_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Optionally include micro-threads
        if include_micro_threads:
            for chunk in conversation["chunks"]:
                micro_threads = await micro_thread_service.get_micro_threads_by_chunk(chunk["id"])
                chunk["microThreads"] = micro_threads
        
        return conversation
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{source_id}/chunks", response_model=List[ChunkResponse])
async def get_conversation_chunks(source_id: str):
    """
    Get all chunks for a conversation
    """
    try:
        chunks = await conversation_service.get_chunks_by_source(source_id)
        return chunks
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{source_id}/metadata")
async def get_conversation_metadata(source_id: str):
    """
    Get metadata for a conversation source
    """
    try:
        metadata = await conversation_service.get_source_metadata(source_id)
        
        if not metadata:
            raise HTTPException(status_code=404, detail="Source not found")
        
        return metadata
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{source_id}/summary")
async def get_conversation_summary(source_id: str):
    """
    Get an AI-generated summary of the conversation
    """
    try:
        summary = await conversation_service.generate_conversation_summary(source_id)
        
        if not summary:
            raise HTTPException(status_code=404, detail="Could not generate summary")
        
        return {"sourceId": source_id, "summary": summary}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))