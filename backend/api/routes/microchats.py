from fastapi import APIRouter, HTTPException, Depends, Query, Body, Path, status
from typing import List, Optional
from datetime import datetime
import uuid
from pydantic import BaseModel, Field, validator

from ..services.microchat_service import MicrochatService
from ..middleware.auth import get_current_user

router = APIRouter(prefix="/api/microchats", tags=["microchats"])
service = MicrochatService()

# Request/Response Models
class MicrochatCreate(BaseModel):
    parent_message_id: str = Field(..., description="ID of the parent message")
    user_message: str = Field(..., min_length=1, max_length=1000, description="Initial user message")

    @validator('parent_message_id')
    def validate_id(cls, v):
        try:
            uuid.UUID(v)
            return v
        except:
            raise ValueError("Invalid UUID format for parent_message_id")

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, description="Message content")

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime
    metadata: dict = {}

class MicrochatResponse(BaseModel):
    id: str
    parent_message_id: str
    user_id: str
    context: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

@router.post("", status_code=status.HTTP_201_CREATED, response_model=MicrochatResponse)
async def create_microchat(data: MicrochatCreate, current_user: dict = Depends(get_current_user)):
    try:
        mc = await service.create_microchat(
            parent_message_id=data.parent_message_id,
            user_message=data.user_message,
            user_id=current_user["id"]
        )
        return mc
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create microchat")

@router.post("/{microchat_id}/messages", status_code=status.HTTP_201_CREATED)
async def add_message(microchat_id: str = Path(...), message: MessageCreate = Body(...), current_user: dict = Depends(get_current_user)):
    try:
        uuid.UUID(microchat_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid microchat_id format")
    try:
        res = await service.add_message(microchat_id=microchat_id, content=message.content, role="user")
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add message")

@router.get("/{microchat_id}", response_model=MicrochatResponse)
async def get_microchat(microchat_id: str = Path(...), current_user: dict = Depends(get_current_user)):
    try:
        uuid.UUID(microchat_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid microchat_id format")
    mc = await service.get_microchat(microchat_id)
    if not mc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Microchat not found")
    if mc.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return mc

@router.get("", response_model=List[MicrochatResponse])
async def search_microchats(query: str = Query(..., min_length=1), limit: int = Query(10, gt=0), current_user: dict = Depends(get_current_user)):
    try:
        return await service.search_microchats(query=query, user_id=current_user["id"], limit=limit)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Search failed")

@router.delete("/{microchat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_microchat(microchat_id: str = Path(...), current_user: dict = Depends(get_current_user)):
    mc = await service.get_microchat(microchat_id)
    if not mc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Microchat not found")
    if mc.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    ok = await service.delete_microchat(microchat_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Delete failed")
    return None
