from fastapi import APIRouter, HTTPException, Depends, Request, Path, Query, Body, status
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import uuid
import logging

# Import schemas
from ..models.schemas import (
    ConversationResponse, ChunkResponse, ChatListResponse, 
    MergeChatRequest, NewChatRequest, NewChatResponse
)
from ..models.hybrid_chat_schemas import HybridChatResponse, HybridChatDetailResponse

# Import services
from ..services.conversation_service import ConversationService
# Removed obsolete micro-thread service import
# Removed obsolete thread service import
from ..services.hybrid_service import HybridChatService
from ..services.database_service import DatabaseService

# Import dependencies
from ..middleware.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)
conversation_service = ConversationService()
# Removed obsolete micro-thread service instantiation
# Removed obsolete thread service instantiation
hybrid_service = HybridChatService()

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

@router.get("/chats", response_model=List[ChatListResponse])
async def list_imported_chats(
    limit: int = Query(50, description="Maximum number of chats to return"),
    offset: int = Query(0, description="Offset for pagination"),
    source_type: Optional[str] = Query(None, description="Filter by source type (e.g., 'chatgpt', 'hybrid', 'claude')")
):
    """
    List all imported chats with optional filtering.
    
    Supported source types:
    - chatgpt: Includes both 'chatgpt' and 'chatgpt-link' imports
    - hybrid: Includes all hybrid/merged chats
    - claude: Claude imports
    - Any other specific import method
    """
    try:
        # Get chats from the conversation service
        chats = await conversation_service.list_imported_chats(limit, offset, source_type)
        
        # Log the first few chats for debugging
        if chats:
            print(f"[DEBUG] Returning {len(chats)} chats. First chat: {chats[0]}")
        else:
            print(f"[DEBUG] No chats found for source_type={source_type}")
            
        return chats
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Error listing chats: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving chats"
        )

@router.post("/conversations/merge", response_model=HybridChatResponse, status_code=status.HTTP_201_CREATED)
async def merge_chats(
    request: MergeChatRequest = Body(...)
):
    """
    Merge multiple chats into a hybrid chat, creating a new hybrid chat containing all messages.
    """
    try:
        if len(request.chatIds) < 2:
            raise HTTPException(status_code=400, detail="At least two chat IDs are required for merging")
        
        result = await hybrid_service.create_hybrid_chat(request.title, request.chatIds)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/merge/{hybrid_chat_id}", response_model=HybridChatDetailResponse, status_code=200)
async def get_hybrid_chat(hybrid_chat_id: str):
    """
    Retrieve a hybrid chat by its ID.
    """
    try:
        hybrid_chat = await hybrid_service.get_hybrid_chat(hybrid_chat_id)
        if not hybrid_chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hybrid chat with ID {hybrid_chat_id} not found"
            )
        return hybrid_chat
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving hybrid chat: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while retrieving hybrid chat"
        )

@router.post("/chats/new", status_code=status.HTTP_200_OK)
async def create_new_chat(
    request: NewChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new empty chat with the same structure as imported chats.
    
    - **title**: Title for the new chat (default: "New Chat")
    - **source_type**: Type of chat (default: "manual")
    - **chat_id**: Optional custom chat ID (must be unique)
    - **metadata**: Optional metadata for the chat
    
    Returns the created chat with the same structure as imported chats.
    """
    try:
        # Generate a new chat ID if not provided
        chat_id = request.chat_id or str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Extract user ID from Supabase user object (now returned as a dictionary from verify_token)
        user_id = current_user.get('id')
        if not user_id:
            logger.error(f"Could not extract user ID from current_user: {current_user}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user authentication")
        
        # Prepare the chat data to match the import chat structure
        chat_data = {
            "id": chat_id,
            "title": request.title or "New Chat",
            "type": request.source_type or "manual",
            "created_at": now,
            "updated_at": now,
            "user_id": user_id,
            "metadata": {
                "import_method": "manual",
                "source_type": request.source_type or "manual",
                "created_via": "api",
                **(request.metadata or {})  # Include any additional metadata
            },
            # Additional fields that might be expected by the frontend
            "sourceType": request.source_type or "manual",
            "importDate": now,
            "chunkCount": 0
        }
        
        # Save to database
        db = DatabaseService()
        try:
            await db.create_source(chat_data)
        except Exception as e:
            if "duplicate" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Chat with ID '{chat_id}' already exists"
                )
            raise
        
        # Return the response in the same format as import chat
        return {
            "sourceId": chat_id,
            "status": "success",
            "message": "Successfully created new chat",
            "chunksProcessed": 0,
            "chat": chat_data  # Include full chat data for reference
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating new chat: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create new chat: {str(e)}"
        )