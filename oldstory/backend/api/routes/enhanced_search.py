from fastapi import APIRouter, HTTPException, Query, Request
from typing import List, Optional
from datetime import datetime
from ..models.schemas import SearchResponse, SearchResult
from ..services.enhanced_search_service import EnhancedSearchService
import time

router = APIRouter()
enhanced_search_service = EnhancedSearchService()

@router.get("/search/enhanced", response_model=SearchResponse)
async def enhanced_search(
    request: Request,
    q: str = Query(..., description="Search query"),
    source_types: Optional[List[str]] = Query(None, description="Filter by source types"),
    date_from: Optional[datetime] = Query(None, description="Filter from date"),
    date_to: Optional[datetime] = Query(None, description="Filter to date"),
    participant: Optional[str] = Query(None, description="Filter by participant"),
    limit: int = Query(10, ge=1, le=50, description="Number of results"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Similarity threshold"),
    search_type: str = Query("hybrid", description="Search type: semantic, text, or hybrid")
):
    """
    Enhanced search with multiple filters and search types
    """
    start_time = time.time()
    
    try:
        if not q.strip():
            raise HTTPException(status_code=400, detail="Search query cannot be empty")
        
        # Log the search query
        await enhanced_search_service.log_search_query(
            query=q,
            filters={
                "source_types": source_types,
                "date_from": date_from.isoformat() if date_from else None,
                "date_to": date_to.isoformat() if date_to else None,
                "participant": participant,
                "search_type": search_type
            }
        )
        
        results = await enhanced_search_service.enhanced_search(
            query=q,
            source_types=source_types,
            date_from=date_from,
            date_to=date_to,
            participant=participant,
            limit=limit,
            threshold=threshold,
            search_type=search_type
        )
        
        # Generate AI response based on search results
        ai_response = None
        if results:
            ai_response = await enhanced_search_service.generate_contextual_response(q, results[:3])
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Update search history with results
        await enhanced_search_service.update_search_history(
            query=q,
            results_count=len(results),
            response_time_ms=round(processing_time * 1000)
        )
        
        return SearchResponse(
            query=q,
            results=results,
            aiResponse=ai_response,
            totalResults=len(results),
            metadata={
                "processingTimeMs": round(processing_time * 1000),
                "threshold": threshold,
                "searchType": search_type,
                "filtersApplied": {
                    "sourceTypes": source_types,
                    "dateRange": bool(date_from or date_to),
                    "participant": bool(participant)
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/suggestions/enhanced")
async def get_enhanced_suggestions(
    q: str = Query(..., description="Partial query for suggestions"),
    limit: int = Query(5, ge=1, le=10),
    include_history: bool = Query(True, description="Include search history")
):
    """
    Get enhanced search suggestions including history and popular searches
    """
    try:
        suggestions = await enhanced_search_service.get_enhanced_suggestions(
            partial_query=q,
            limit=limit,
            include_history=include_history
        )
        return {"suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/filters")
async def get_search_filters(user_id: str = None):
    """
    Get available filter options for search
    """
    try:
        filters = await enhanced_search_service.get_available_filters(user_id)
        return filters
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search/save")
async def save_search(
    query: str,
    filters: dict = None,
    name: str = None,
    user_id: str = None
):
    """
    Save a search query for later use
    """
    try:
        saved_search_id = await enhanced_search_service.save_search(
            query=query,
            filters=filters or {},
            name=name,
            user_id=user_id
        )
        return {"id": saved_search_id, "message": "Search saved successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/saved")
async def get_saved_searches(user_id: str = None):
    """
    Get user's saved searches
    """
    try:
        saved_searches = await enhanced_search_service.get_saved_searches(user_id)
        return {"savedSearches": saved_searches}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))