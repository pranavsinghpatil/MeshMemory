from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..models.schemas import SearchResponse, SearchResult
from ..services.search_service import SearchService

router = APIRouter()
search_service = SearchService()

@router.get("/search", response_model=SearchResponse)
async def search_conversations(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Number of results to return"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Similarity threshold")
):
    """
    Search across all conversations using semantic similarity
    """
    try:
        if not q.strip():
            raise HTTPException(status_code=400, detail="Search query cannot be empty")
        
        results = await search_service.semantic_search(
            query=q,
            limit=limit,
            threshold=threshold
        )
        
        # Generate AI response based on search results
        ai_response = None
        if results:
            ai_response = await search_service.generate_ai_response(q, results[:3])
        
        return SearchResponse(
            query=q,
            results=results,
            aiResponse=ai_response,
            totalResults=len(results)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/suggestions")
async def get_search_suggestions(
    q: str = Query(..., description="Partial query for suggestions"),
    limit: int = Query(5, ge=1, le=10)
):
    """
    Get search suggestions based on partial query
    """
    try:
        suggestions = await search_service.get_suggestions(q, limit)
        return {"suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))