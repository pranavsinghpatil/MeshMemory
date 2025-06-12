from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Union
import uvicorn
import os
from datetime import datetime
import uuid
import logging
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.logging import LoggingIntegration

# Initialize Sentry for error monitoring
sentry_logging = LoggingIntegration(
    level=logging.INFO,        # Capture info and above as breadcrumbs
    event_level=logging.ERROR  # Send errors as events
)

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),  # Set this in your environment
    integrations=[
        FastApiIntegration(auto_enabling_integrations=False),
        sentry_logging,
    ],
    traces_sample_rate=0.1,  # Adjust based on your needs
    environment=os.getenv("ENVIRONMENT", "development"),
)

# Import route modules
from api.routes import import_routes, conversations, threads, search, micro_threads, user_settings
from api.routes import analytics, enhanced_search, data_management, pagination
from api.middleware.auth import get_current_user, get_optional_user

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="knitter.app API",
    description="AI Conversation Management Backend with Error Monitoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://*.vercel.app", "https://*.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Middleware for request logging and error handling
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = datetime.now()
    
    # Log request details
    logger.info(f"Request: {request.method} {request.url}")
    
    try:
        response = await call_next(request)
        
        # Log response details
        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Response: {response.status_code} - Duration: {duration:.3f}s")
        
        return response
        
    except Exception as e:
        # Log error with context
        duration = (datetime.now() - start_time).total_seconds()
        logger.error(f"Request failed: {request.method} {request.url} - Duration: {duration:.3f}s - Error: {str(e)}")
        
        # Capture additional context for Sentry
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("endpoint", str(request.url))
            scope.set_tag("method", request.method)
            scope.set_extra("duration", duration)
            scope.set_extra("user_agent", request.headers.get("user-agent"))
            
        # Re-raise the exception to be handled by FastAPI
        raise e

# Include routers with authentication
app.include_router(import_routes.router, prefix="/api", tags=["import"])
app.include_router(conversations.router, prefix="/api", tags=["conversations"])
app.include_router(threads.router, prefix="/api", tags=["threads"])
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(enhanced_search.router, prefix="/api", tags=["enhanced-search"])
app.include_router(micro_threads.router, prefix="/api", tags=["micro-threads"])
app.include_router(user_settings.router, prefix="/api", tags=["user-settings"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(data_management.router, prefix="/api", tags=["data-management"])
app.include_router(pagination.router, prefix="/api", tags=["pagination"])

@app.get("/")
async def root():
    return {"message": "knitter.app API is running", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        from api.services.database_service import DatabaseService
        db_service = DatabaseService()
        conn = await db_service.get_connection()
        
        if conn:
            # Simple query to test DB
            await conn.fetchval("SELECT 1")
            await db_service.release_connection(conn)
            db_status = "healthy"
        else:
            db_status = "unhealthy"
        
        # Test cache connection
        from api.services.cache_service import CacheService
        cache_service = CacheService()
        cache_status = "healthy" if cache_service.enabled else "disabled"
        
        return {
            "status": "healthy" if db_status == "healthy" else "degraded",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "services": {
                "database": db_status,
                "cache": cache_status
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "error": str(e)
        }

@app.get("/sentry-debug")
async def trigger_error():
    """Endpoint to test Sentry error reporting"""
    division_by_zero = 1 / 0

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
