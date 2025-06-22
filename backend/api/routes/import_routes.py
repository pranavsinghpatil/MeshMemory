import logging
import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from pydantic import BaseModel

# Import models and services
from ..models.schemas import (
    ImportRequest, 
    ImportResponse, 
    ImportGroupedResponse, 
    HybridChatRequest,
    ImportBatch as ImportBatchModel
)
from ..models.import_batch import ImportBatch as ImportBatchModel
from ..services.import_service import ImportService
from ..dependencies import get_current_user

# Configure logger
logger = logging.getLogger(__name__)

# Security settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"text/plain", "application/pdf", "image/png", "image/jpeg"}
ALLOWED_URL_DOMAINS = {"example.com", "knitter.app"}  # TODO: update with real domains

# Initialize router and services
router = APIRouter()
import_service = ImportService()

# Request models
class ImportFormData(BaseModel):
    """Form data model for import requests."""
    type: str
    url: Optional[str] = None
    title: Optional[str] = None
    group_id: Optional[str] = None  # For artefact grouping
@router.post("/import", response_model=ImportResponse)
async def import_source(
    type: str = Form(...),
    url: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    html: Optional[str] = Form(None),
    group_id: Optional[str] = Form(None)
):
    """
    Import a conversation source from various platforms.
    Only accepts high-level source types ('chatgpt', 'claude', 'gemini', 'grok', 'mistral', 'deepseek', 'other').
    Specific import method details are stored in metadata.
    """
    try:
        allowed_types = ["chatgpt", "claude", "gemini", "pdf", "grok", "mistral", "deepseek", "other"]
        if type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid source type. Allowed: {', '.join(allowed_types)}")

        # Validate required fields for each type
        if type in ["chatgpt", "grok", "mistral", "deepseek"] and not url:
            raise HTTPException(status_code=400, detail="URL required for this source type")
        if type in ["claude", "gemini", "pdf"] and not file:
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

        # Determine input type and route to correct parser
        if text:
            # Handle pasted plain text
            from ..services.parsers import TextParser
            parser = TextParser()
            import_method = "copy_paste"
            file_obj = None
            if file:
                file_obj = file
            else:
                # Create a pseudo UploadFile from text
                file_obj = UploadFile(
                    filename="pasted.txt", 
                    file=io.BytesIO(text.encode("utf-8")), 
                    content_type="text/plain"
                )
            result = await import_service.process_import(
                source_type="copy_paste",
                title=title,
                file=file_obj,
                group_id=group_id
            )
        elif html:
            # Handle pasted HTML
            from ..services.parsers import HTMLParser
            parser = HTMLParser()
            import_method = "html"
            file_obj = UploadFile(
                filename="pasted.html", 
                file=io.BytesIO(html.encode("utf-8")), 
                content_type="text/html"
            )
            result = await import_service.process_import(
                source_type="html",
                title=title,
                file=file_obj,
                group_id=group_id
            )
        else:
            # Fallback to file or URL import
            result = await import_service.process_import(
                source_type=type,
                url=url,
                title=title,
                file=file,
                group_id=group_id
            )

        return ImportResponse(
            sourceId=result.get("sourceId", ""),
            chatId=result.get("chatId", ""),
            status=result.get("status", "success"),
            message=result.get("message", ""),
            chunksProcessed=result.get("chunksProcessed", 0),
            isHybridCandidate=result.get("isHybridCandidate", False),
            hybridCompatibleWith=result.get("hybridCompatibleWith", [])
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in import_source: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
@router.post("/hybrid/create")
async def create_hybrid_chat(
    request: HybridChatRequest
):
    """
    Create a new hybrid chat by merging multiple existing chats.
    
    Args:
        request: HybridChatRequest containing:
            - chat_ids: List of chat IDs to merge
            - title: Title for the new hybrid chat
            - sort_method: How to sort messages ('timestamp', 'artefact_order', or 'custom')
            - metadata: Optional metadata for the hybrid chat
    """
    try:
        result = await import_service.create_hybrid_chat(
            chat_ids=request.chat_ids,
            title=request.title,
            sort_method=request.sort_method,
            metadata=request.metadata or {}
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_hybrid_chat: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create hybrid chat: {str(e)}")
# Grouped import endpoint
@router.post("/import/grouped", response_model=ImportGroupedResponse)
async def import_grouped(
    user_id: str = Depends(get_current_user),
    files: List[UploadFile] = File(None),
    urls: List[str] = Form(None),
    types: List[str] = Form(None),
    titles: List[str] = Form(None),
    import_batch_title: Optional[str] = Form(None, alias="importBatchTitle"),
    metadata: Optional[str] = Form(None)
):
    """
    Import multiple artefacts as a single grouped chat.
    
    Args:
        user_id: ID of the user performing the import (from auth)
        files: List of uploaded files to import
        urls: List of URLs to import
        types: List of source types for each file/URL
        titles: List of titles for each file/URL
        import_batch_title: Optional title for the import batch
        metadata: Optional JSON string containing additional metadata
        
    Returns:
        ImportGroupedResponse containing import status and statistics
    """
    try:
        # Validate inputs
        if not files and not urls:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one file or URL must be provided"
            )
            
        if files and types and len(files) != len(types):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Number of files must match number of types"
            )
            
        if urls and types and len(urls) != len(types):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Number of URLs must match number of types"
            )

        # Parse metadata if provided
        metadata_dict = {}
        if metadata:
            try:
                metadata_dict = json.loads(metadata)
                if not isinstance(metadata_dict, dict):
                    raise ValueError("Metadata must be a JSON object")
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid metadata format. Must be valid JSON"
                )

        # Create import batch
        import_batch = ImportBatchModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=import_batch_title or f"Grouped Import {datetime.now().isoformat()}",
            created_at=datetime.now(),
            artefact_count=0,
            chunks_processed=0,
            metadata=metadata_dict
        )

        # Process each artefact
        artefacts = []
        processed_count = 0
        error_count = 0
        
        # Process files if any
        if files:
            for i, file in enumerate(files):
                try:
                    artefact_type = types[i] if types and i < len(types) else "file"
                    title = titles[i] if titles and i < len(titles) else file.filename or f"File {i+1}"
                    
                    # Process each file import
                    result = await import_service.process_import(
                        source_type=artefact_type,
                        file=file,
                        title=title,
                        group_id=import_batch.id
                    )
                    
                    artefacts.append({
                        "id": result.get("sourceId"),
                        "type": artefact_type,
                        "title": title,
                        "status": "success",
                        "chunks_processed": result.get("chunksProcessed", 0)
                    })
                    processed_count += 1
                    
                except Exception as e:
                    error_count += 1
                    logger.error(f"Error processing file {i+1}: {str(e)}", exc_info=True)
                    artefacts.append({
                        "type": artefact_type if 'artefact_type' in locals() else "unknown",
                        "title": file.filename if hasattr(file, 'filename') else f"File {i+1}",
                        "status": "error",
                        "error": str(e)
                    })

        # Process URLs if any
        if urls:
            for i, url in enumerate(urls):
                try:
                    artefact_type = types[i] if types and i < len(types) else "url"
                    title = titles[i] if titles and i < len(titles) else f"URL {i+1}"
                    
                    # Process each URL import
                    result = await import_service.process_import(
                        source_type=artefact_type,
                        url=url,
                        title=title,
                        group_id=import_batch.id
                    )
                    
                    artefacts.append({
                        "id": result.get("sourceId"),
                        "type": artefact_type,
                        "title": title,
                        "status": "success",
                        "chunks_processed": result.get("chunksProcessed", 0)
                    })
                    processed_count += 1
                    
                except Exception as e:
                    error_count += 1
                    logger.error(f"Error processing URL {i+1}: {str(e)}", exc_info=True)
                    artefacts.append({
                        "type": artefact_type if 'artefact_type' in locals() else "url",
                        "title": f"URL {i+1}",
                        "status": "error",
                        "error": str(e)
                    })

        # Update import batch with results
        import_batch.artefacts = artefacts
        import_batch.artefact_count = len(artefacts)
        import_batch.chunks_processed = sum(
            a.get("chunks_processed", 0) 
            for a in artefacts 
            if a.get("status") == "success"
        )

        # Save import batch to database
        try:
            await import_service.db_service.create_import_batch(import_batch.dict())
        except Exception as e:
            logger.error(f"Error saving import batch: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save import batch: {str(e)}"
            )

        # Prepare response
        status_msg = "completed"
        if error_count > 0:
            status_msg = "partial" if processed_count > 0 else "failed"
            
        return {
            "importBatchId": import_batch.id,
            "chunksProcessed": import_batch.chunks_processed,
            "artefactCount": processed_count,
            "errorCount": error_count,
            "status": status_msg,
            "artefacts": artefacts
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in import_grouped: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

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