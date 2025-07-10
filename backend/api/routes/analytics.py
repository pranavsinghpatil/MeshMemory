from fastapi import APIRouter, HTTPException, Depends, Query, Body, status
from typing import Dict, Any, List, Optional
from ..services.analytics_service import AnalyticsService
from ..dependencies import get_current_user  # Minimal stub for dev/demo; replace with real auth if needed

router = APIRouter()
analytics_service = AnalyticsService()

@router.get("/analytics/dashboard", summary="Get dashboard analytics")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    """
    Get comprehensive dashboard analytics for the authenticated user
    """
    try:
        analytics = await analytics_service.get_dashboard_analytics(current_user["id"])
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/trends", summary="Get conversation trends over time")
async def get_conversation_trends(
    days: int = Query(30, ge=1, description="Days to include"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get conversation trends over time
    """
    try:
        trends = await analytics_service.get_conversation_trends(current_user["id"], days)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/insights", summary="Get search insights")
async def get_search_insights(current_user: dict = Depends(get_current_user)):
    """
    Get insights from user search patterns
    """
    try:
        insights = await analytics_service.get_search_insights(current_user["id"])
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/model-usage", summary="Get model usage stats")
async def get_model_usage_stats(
    days: int = Query(30, ge=1, description="Days to include"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get AI model usage statistics
    """
    try:
        stats = await analytics_service.get_model_usage_stats(current_user["id"], days)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/threads/{thread_id}", summary="Get thread insights")
async def get_thread_insights(
    thread_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed insights for a specific thread
    """
    try:
        insights = await analytics_service.get_thread_insights(thread_id)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/export", summary="Export analytics data")
async def export_analytics(
    export_type: str = Body(..., description="Type of export"),
    date_range: Optional[Dict[str, str]] = Body(None, description="Date range"),
    current_user: dict = Depends(get_current_user)
):
    """
    Export analytics data in various formats
    """
    try:
        job_id = await analytics_service.create_export_job(
            user_id=current_user["id"],
            export_type=export_type,
            date_range=date_range
        )
        return {"job_id": job_id, "status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/export/{job_id}", summary="Get export job status")
async def get_export_status(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get status of an export job
    """
    try:
        status = await analytics_service.get_export_status(job_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))