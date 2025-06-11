from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Dict, Any, Optional
from pydantic import BaseModel
import os
import json
from ..services.user_service import UserService
from ..services.llm_service import LLMService

router = APIRouter()
user_service = UserService()
llm_service = LLMService()

class ApiKeys(BaseModel):
    keys: Dict[str, str]

class ApiKeyTest(BaseModel):
    provider: str
    key: str

@router.get("/user/settings")
async def get_user_settings(user_id: str = None):
    """
    Get user settings
    """
    try:
        settings = await user_service.get_user_settings(user_id)
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/settings")
async def update_user_settings(
    settings: Dict[str, Any] = Body(...),
    user_id: str = None
):
    """
    Update user settings
    """
    try:
        updated_settings = await user_service.update_user_settings(user_id, settings)
        return updated_settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/settings/api-keys")
async def get_api_keys(user_id: str = None):
    """
    Get user's API keys
    """
    try:
        api_keys = await user_service.get_api_keys(user_id)
        return api_keys
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/settings/api-keys")
async def save_api_keys(
    api_keys: ApiKeys,
    user_id: str = None
):
    """
    Save user's API keys
    """
    try:
        result = await user_service.save_api_keys(user_id, api_keys.keys)
        return {"success": True, "message": "API keys saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/settings/test-api-key")
async def test_api_key(
    test_data: ApiKeyTest,
    user_id: str = None
):
    """
    Test if an API key is valid
    """
    try:
        is_valid = await llm_service.test_api_key(test_data.provider, test_data.key)
        return {"valid": is_valid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))