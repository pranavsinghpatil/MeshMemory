from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models.schemas import ConversationResponse, ChunkResponse
from ..services.conversation_service import ConversationService

router = APIRouter()
conversation_service = ConversationService()

@router.get("/conversations/{source_id}", response_model=ConversationResponse)
async def get_conversation(source_id: str):
    """
    Get conversation chunks for a specific source
    """
    try:
        conversation = await conversation_service.get_conversation_by_source(source_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
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