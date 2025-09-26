from fastapi import APIRouter, HTTPException, Query, Depends, Request, status
from typing import List, Optional
from ..models.schemas import SearchResponse, SearchResult
from ..services.search_service import SearchService
from ..middleware.auth import get_current_user
import time

router = APIRouter()
search_service = SearchService()

from fastapi import Depends
from ..middleware.auth import get_current_user

router = APIRouter()
@router.get("/search", response_model=SearchResponse, summary="Search conversations")
async def search_conversations(
    request: Request,
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Number of results to return"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Similarity threshold"),
    current_user: dict = Depends(get_current_user)
):
    """
    Search across all conversations using semantic similarity
    """
    start_time = time.time()

    if not q.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Search query cannot be empty")

    results = await search_service.semantic_search(
        query=q,
        limit=limit,
        threshold=threshold
    )

    ai_response: Optional[str] = None
    if results:
        ai_response = await search_service.generate_ai_response(q, results[:3])

    processing_time_ms = round((time.time() - start_time) * 1000)

    return SearchResponse(
        query=q,
        results=results,
        aiResponse=ai_response,
        totalResults=len(results),
        metadata={"processingTimeMs": processing_time_ms, "threshold": threshold}
    )

@router.get("/search/suggestions", response_model=List[str], summary="Get search suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=1, description="Partial query for suggestions"),
    limit: int = Query(5, ge=1, le=10),
    current_user: dict = Depends(get_current_user)
):
    """
    Get search suggestions based on partial query
    """
    try:
        suggestions = await search_service.get_suggestions(q, limit)
        return {"suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))