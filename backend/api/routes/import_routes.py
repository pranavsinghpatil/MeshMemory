from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from typing import Optional, Union, List
import uuid
import asyncio
from datetime import datetime

from ..services.import_service import ImportService
import urllib.parse

# Security settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"text/plain", "application/pdf", "image/png", "image/jpeg"}
ALLOWED_URL_DOMAINS = {"example.com", "knitter.app"}  # TODO: update with real domains
from ..models.schemas import ImportRequest, ImportResponse, ImportGroupedRequest, ImportGroupedResponse

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
    Import a conversation source from various platforms.
    Only accepts high-level source types ('chatgpt', 'claude', 'gemini', 'grok', 'mistral', 'deepseek', 'other').
    Specific import method details are stored in metadata.
    """
    try:
        allowed_types = ["chatgpt", "claude", "gemini", "grok", "mistral", "deepseek", "other"]
        if type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid source type. Allowed: {', '.join(allowed_types)}")

        # Validate required fields for each type
        if type in ["chatgpt", "grok", "mistral", "deepseek"] and not url:
            raise HTTPException(status_code=400, detail="URL required for this source type")
        if type in ["claude", "gemini"] and not file:
            raise HTTPException(status_code=400, detail="File required for this source type")

        # Security: validate file size and type
        if file:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large (max 10MB)")
            if file.content_type not in ALLOWED_MIME_TYPES:
                raise HTTPException(status_code=400, detail=f"Invalid file type {file.content_type}")
            # reset file stream
            file.file.seek(0)

        # Security: validate URL domain
        if url:
            hostname = urllib.parse.urlparse(url).hostname or ""
            if hostname not in ALLOWED_URL_DOMAINS:
                raise HTTPException(status_code=400, detail=f"URL host '{hostname}' not allowed")
async def import_source(
    type: str = Form(...),
    url: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Import a conversation source from various platforms.
    Only accepts high-level source types ('chatgpt', 'claude', 'gemini', 'grok', 'mistral', 'deepseek', 'other').
    Specific import method details are stored in metadata.
    """
    try:
        allowed_types = ["chatgpt", "claude", "gemini", "grok", "mistral", "deepseek", "other"]
        if type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid source type. Allowed: {', '.join(allowed_types)}")

        # Validate required fields for each type
        if type in ["chatgpt", "grok", "mistral", "deepseek"] and not url:
            raise HTTPException(status_code=400, detail="URL required for this source type")
        if type in ["claude", "gemini"] and not file:
            raise HTTPException(status_code=400, detail="File required for this source type")

        # Process the import (import_service will normalize and store import_method in metadata)
                # Process the import (import_service will normalize and store import_method in metadata)
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

@router.post("/hybrid/create")
async def create_hybrid_chat(
    request: HybridChatRequest
):
    """Create a new hybrid chat by merging multiple existing chats."""
    try:
        result = await import_service.create_hybrid_chat(
            chat_ids=request.chatIds,
            title=request.title,
            sort_method=request.sortMethod,
            metadata=request.metadata
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Grouped import endpoint
@router.post("/import/grouped", response_model=ImportGroupedResponse)
async def import_grouped(
    user_id: str = Depends(get_current_user),
    files: List[UploadFile] = File(None),
    urls: List[str] = Form(None),
    types: List[str] = Form(None),
    titles: List[str] = Form(None),
    importBatchTitle: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None)
):
    """
    Import multiple artefacts as a single grouped chat.
    """
    try:
        artefacts = []
        if files:
            for idx, file in enumerate(files):
                artefacts.append({
                    "type": types[idx] if types and idx < len(types) else "copy_paste",
                    "file": file,
                    "title": titles[idx] if titles and idx < len(titles) else file.filename
                })
        if urls:
            for idx, url in enumerate(urls):
                artefacts.append({
                    "type": types[len(files)+idx] if types and (len(files)+idx) < len(types) else "link",
                    "url": url,
                    "title": titles[len(files)+idx] if titles and (len(files)+idx) < len(titles) else url
                })
        result = await import_service.process_grouped_import(
            user_id=user_id,
            artefacts=artefacts,
            import_batch_title=importBatchTitle,
            metadata=json.loads(metadata) if metadata else None
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
async def create_hybrid_chat(
    request: HybridChatRequest
):
    """Create a new hybrid chat by merging multiple existing chats."""
    try:
        result = await import_service.create_hybrid_chat(
            chat_ids=request.chatIds,
            title=request.title,
            sort_method=request.sortMethod,
            metadata=request.metadata
        )
        return result
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