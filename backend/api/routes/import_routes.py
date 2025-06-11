from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, Union
import uuid
import asyncio
from datetime import datetime

from ..services.import_service import ImportService
from ..models.schemas import ImportRequest, ImportResponse

router = APIRouter()
import_service = ImportService()

class ImportFormData(BaseModel):
    type: str
    url: Optional[str] = None
    title: Optional[str] = None

@router.post("/import", response_model=ImportResponse)
async def import_source(
    type: str = Form(...),
    url: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Import a conversation source from various platforms
    """
    try:
        # Validate input
        if type not in ["chatgpt", "claude", "gemini", "youtube"]:
            raise HTTPException(status_code=400, detail="Invalid source type")
        
        if type in ["chatgpt", "youtube"] and not url:
            raise HTTPException(status_code=400, detail="URL required for this source type")
        
        if type in ["claude", "gemini"] and not file:
            raise HTTPException(status_code=400, detail="File required for this source type")
        
        # Process the import
        result = await import_service.process_import(
            source_type=type,
            url=url,
            title=title,
            file=file
        )
        
        return ImportResponse(
            sourceId=result["source_id"],
            status="success",
            message=f"Successfully imported {type} source",
            chunksProcessed=result.get("chunks_processed", 0)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/import/status/{source_id}")
async def get_import_status(source_id: str):
    """
    Get the status of an import operation
    """
    try:
        status = await import_service.get_import_status(source_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))