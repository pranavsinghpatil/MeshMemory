from fastapi import APIRouter, HTTPException, Depends, Query, Body, Path, status
from typing import List, Optional
import uuid
from pydantic import BaseModel, Field

from ..dependencies import get_current_user  # Minimal stub for dev/demo; replace with real auth if needed
from ..models.schemas import (
    MicrochatCreate, 
    MicrochatResponse, 
    UpdateBranchStatusRequest,
    PromoteBranchRequest, 
    BranchesResponse,
    MessageCreate
)
from ..services.microchat_service import MicrochatService, BRANCH_TYPES

router = APIRouter()
service = MicrochatService()

@router.get("/branch-types", status_code=status.HTTP_200_OK)
async def get_branch_types():
    return {"branch_types": ["deep-dive", "refactor", "translate", "summarize", "custom"]}

@router.post("", status_code=status.HTTP_201_CREATED, response_model=MicrochatResponse)
async def create_microchat(data: MicrochatCreate, current_user: dict = Depends(get_current_user)):
    try:
        return await service.create_microchat(
            parent_message_id=data.parent_message_id,
            user_message=data.user_message,
            user_id=current_user["id"],
            is_branch=data.is_branch,
            parent_chat_id=data.parent_chat_id,
            branch_type=data.branch_type
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create microchat: {str(e)}")

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

# Get branch type options
@router.get("/branch-types", response_model=List[str])
async def get_branch_types():
    """Get all available branch types"""
    return BRANCH_TYPES

# Branch-related endpoints
@router.post("/branch-status", status_code=status.HTTP_200_OK, response_model=MicrochatResponse)
async def update_branch_status(data: UpdateBranchStatusRequest, current_user: dict = Depends(get_current_user)):
    """Update the status of a branch microchat (ephemeral or pinned)"""
    try:
        updated = await service.update_branch_status(data.microchat_id, data.status)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update branch status")

@router.post("/promote", status_code=status.HTTP_200_OK)
async def promote_branch(data: PromoteBranchRequest, current_user: dict = Depends(get_current_user)):
    """Promote a branch microchat to the main chat"""
    try:
        result = await service.promote_branch_to_main(data.microchat_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to promote branch: {str(e)}")

@router.get("/branches/message/{parent_message_id}", status_code=status.HTTP_200_OK, response_model=BranchesResponse)
async def get_branches_for_message(parent_message_id: str, current_user: dict = Depends(get_current_user)):
    """Get all branches for a specific message"""
    try:
        # Validate UUID format
        try:
            uuid.UUID(parent_message_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid parent message ID format")
        
        # Get branches
        branches = await service.get_branches_for_message(parent_message_id)
        return {"branches": branches}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get branches: {str(e)}")

@router.get("/branches/chat/{parent_chat_id}", status_code=status.HTTP_200_OK, response_model=BranchesResponse)
async def get_branches_for_chat(parent_chat_id: str, current_user: dict = Depends(get_current_user)):
    """Get all branches for a specific chat"""
    try:
        # Validate UUID format
        try:
            uuid.UUID(parent_chat_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid parent chat ID format")
        
        # Get branches
        branches = await service.get_branches_for_chat(parent_chat_id)
        return {"branches": branches}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get branches: {str(e)}")
