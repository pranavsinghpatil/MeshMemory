from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Dict, Any, Optional
from pydantic import BaseModel
import os
import json
from ..services.user_service import UserService
from ..services.llm_service import LLMService

from ..dependencies import get_current_user  # Minimal stub for dev/demo; replace with real auth if needed

router = APIRouter()
user_service = UserService()
llm_service = LLMService()

class ApiKeys(BaseModel):
    keys: Dict[str, str]

class ApiKeyTest(BaseModel):
    provider: str
    key: str

@router.get("/settings", summary="Get user settings")
async def get_user_settings(current_user: dict = Depends(get_current_user)):
    """
    Get user settings
    """
    try:
        settings = await user_service.get_user_settings(current_user["id"]) 
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings", summary="Update user settings")
async def update_user_settings(
    settings: Dict[str, Any] = Body(...),
    current_user: dict = Depends(get_current_user)
) :
    """
    Update user settings
    """
    try:
        updated_settings = await user_service.update_user_settings(current_user["id"], settings) 
        return updated_settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings-keys", summary="Get user API keys")
async def get_api_keys(current_user: dict = Depends(get_current_user)):
    """
    Get user's API keys
    """
    try:
        api_keys = await user_service.get_api_keys(current_user["id"]) 
        return api_keys
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings-keys", summary="Save user API keys")
async def save_api_keys(
    api_keys: ApiKeys,
    current_user: dict = Depends(get_current_user)
) :
    """
    Save user's API keys
    """
    try:
        result = await user_service.save_api_keys(current_user["id"], api_keys.keys) 
        return {"success": True, "message": "API keys saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings/test-api-key", summary="Test user API key")
async def test_api_key(
    test_data: ApiKeyTest,
    current_user: dict = Depends(get_current_user)
) :
    """
    Test if an API key is valid
    """
    try:
        is_valid = await llm_service.test_api_key(test_data.provider, test_data.key)
        return {"valid": is_valid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))