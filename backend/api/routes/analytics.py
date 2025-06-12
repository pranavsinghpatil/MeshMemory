from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from ..services.database_service import DatabaseService
from ..services.analytics_service import AnalyticsService

router = APIRouter()
db_service = DatabaseService()
analytics_service = AnalyticsService()

@router.get("/analytics/dashboard")
async def get_dashboard_analytics(user_id: str = None):
    """
    Get comprehensive dashboard analytics for a user
    """
    try:
        analytics = await analytics_service.get_dashboard_analytics(user_id)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/conversation-trends")
async def get_conversation_trends(
    user_id: str = None,
    days: int = 30
):
    """
    Get conversation trends over time
    """
    try:
        trends = await analytics_service.get_conversation_trends(user_id, days)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/search-insights")
async def get_search_insights(user_id: str = None):
    """
    Get insights from user search patterns
    """
    try:
        insights = await analytics_service.get_search_insights(user_id)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/model-usage")
async def get_model_usage_stats(
    user_id: str = None,
    days: int = 30
):
    """
    Get AI model usage statistics
    """
    try:
        stats = await analytics_service.get_model_usage_stats(user_id, days)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/thread-insights/{thread_id}")
async def get_thread_insights(thread_id: str):
    """
    Get detailed insights for a specific thread
    """
    try:
        insights = await analytics_service.get_thread_insights(thread_id)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analytics/export")
async def export_analytics(
    export_type: str,
    user_id: str = None,
    date_range: Optional[Dict[str, str]] = None
):
    """
    Export analytics data in various formats
    """
    try:
        job_id = await analytics_service.create_export_job(
            user_id=user_id,
            export_type=export_type,
            date_range=date_range
        )
        return {"job_id": job_id, "status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/export/{job_id}")
async def get_export_status(job_id: str):
    """
    Get status of an export job
    """
    try:
        status = await analytics_service.get_export_status(job_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))