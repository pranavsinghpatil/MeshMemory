from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel

from api.services.merge_service import MergeService
from api.models import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/conversations", tags=["Merge"])

class MergeRequest(BaseModel):
    chat_ids: List[str]
    title: Optional[str] = None

@router.post("/merge", status_code=status.HTTP_201_CREATED)
async def merge_chats(
    request: MergeRequest,
    user_id: str = "system",  # Replace with actual auth
    db: Session = Depends(get_db)
):
    """
    Merge multiple chats into a new hybrid chat.
    
    - **chat_ids**: List of chat IDs to merge (minimum 2)
    - **title**: Optional title for the new hybrid chat
    """
    service = MergeService(db_session=db)
    try:
        result = service.merge_chats(
            chat_ids=request.chat_ids,
            title=request.title,
            user_id=user_id
        )
        return {
            "success": True,
            "message": "Chats merged successfully",
            "data": result
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to merge chats: {str(e)}"
        )
