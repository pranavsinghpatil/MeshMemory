"""
Routes for managing hybrid chats created by merging multiple chat sources.
"""
from fastapi import APIRouter, HTTPException, status, Body
from typing import List
from ..models.hybrid_chat_schemas import HybridChatCreate, HybridChatResponse, HybridChatDetailResponse
from ..services.hybrid_service import HybridChatService

router = APIRouter(prefix="/chats/merge", tags=["Chat Merge"])
hybrid_service = HybridChatService()

@router.post(
    "/", 
    response_model=HybridChatResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_hybrid_chat(hybrid_chat: HybridChatCreate):
    """
    Create a new hybrid chat by merging multiple source chats.
    """
    try:
        if len(hybrid_chat.source_ids) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least two source chats are required to create a hybrid chat"
            )
            
        result = await hybrid_service.create_hybrid_chat(
            title=hybrid_chat.title,
            source_ids=hybrid_chat.chatIds
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create hybrid chat: {str(e)}"
        )

@router.get(
    "/{hybrid_chat_id}",
    response_model=HybridChatDetailResponse,
    responses={
        200: {"model": HybridChatDetailResponse},
        404: {"description": "Hybrid chat not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_hybrid_chat(hybrid_chat_id: str):
    """
    Get a hybrid chat by ID with all its chunks and metadata.
    
    Args:
        hybrid_chat_id: The ID of the hybrid chat to retrieve
        
    Returns:
        Hybrid chat details including all chunks and metadata
    """
    try:
        hybrid_chat = await hybrid_service.get_hybrid_chat(hybrid_chat_id)
        if not hybrid_chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hybrid chat with ID {hybrid_chat_id} not found"
            )
            
        # Transform the response to match the HybridChatDetailResponse model
        response = {
            "hybridChatId": hybrid_chat["id"],
            "title": hybrid_chat["title"],
            "chunkCount": len(hybrid_chat.get("chunks", [])),
            "sourceChats": hybrid_chat.get("metadata", {}).get("merged_from", []),
            "createdAt": hybrid_chat["created_at"],
            "chunks": hybrid_chat.get("chunks", []),
            "metadata": hybrid_chat.get("metadata", {})
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve hybrid chat: {str(e)}"
        )
