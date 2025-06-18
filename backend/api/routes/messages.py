from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
import uuid

from ..services.message_service import MessageService
from ..middleware.auth import get_current_user

router = APIRouter(prefix="/api/messages", tags=["messages"])
service = MessageService()

class MessageCreate(BaseModel):
    source_id: str = Field(..., description="ID of the conversation source")
    participant_label: Optional[str] = Field(None, description="Label of the message sender")
    content: str = Field(..., min_length=1, description="Message content")
    model_name: Optional[str] = Field(None, description="Model that generated the message")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

    @validator('source_id')
    def validate_source_id(cls, v):
        try:
            uuid.UUID(v)
            return v
        except:
            raise ValueError("Invalid UUID format for source_id")

class MessageResponse(BaseModel):
    id: str
    source_id: str
    participant_label: Optional[str]
    content: str
    model_name: Optional[str]
    metadata: Dict[str, Any]
    timestamp: datetime

@router.get("", response_model=List[MessageResponse])
async def list_messages(
    limit: int = Query(50, gt=0),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user)
):
    msgs = await service.list_messages(limit=limit, offset=offset)
    return msgs

@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: str = Path(..., description="Message ID"),
    current_user: dict = Depends(get_current_user)
):
    try:
        uuid.UUID(message_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid message_id format")
    msg = await service.get_message(message_id)
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return msg

@router.post("", status_code=status.HTTP_201_CREATED, response_model=MessageResponse)
async def create_message(
    data: MessageCreate = Body(...),
    current_user: dict = Depends(get_current_user)
):
    msg_data = data.dict()
    # Assign timestamp and id
    msg_data['id'] = str(uuid.uuid4())
    msg_data['timestamp'] = datetime.utcnow().isoformat()
    try:
        saved = await service.create_message(msg_data)
        return saved
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
