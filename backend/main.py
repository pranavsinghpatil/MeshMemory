"""MeshMemory main entry – patched for Python 3.12 + pydantic 1.x compatibility."""

# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# Regular imports
# ---------------------------------------------------------------------------
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
import traceback
from dotenv import load_dotenv
# Adjust path to load from project root
project_root = os.path.abspath(os.path.dirname(__file__))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

# Import route modules
try:
    from api.routes import auth
    from api.routes import import_routes
    from api.routes import search
    from api.routes import user_settings
    from api.routes import analytics
    from api.routes import enhanced_search
    from api.routes import data_management
    from api.routes import pagination
    from api.routes import microchats    
    from api.routes.conversations import router as conversations_router
    from api.routes.messages import router as messages_router
    from api.routes.hybrid_chats import router as chat_merge_router
    from api.middleware.auth import get_current_user, get_optional_user
except ImportError as e:
    print(f"Error importing routes: {str(e)}")
    traceback.print_exc()
    raise

# Configure logging
log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file_path),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
app = FastAPI(
    title="MeshMemory API",
    description="AI Conversation Management Backend with Error Monitoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        # Production deployments 
        "https://*.vercel.app", 
        "https://*.netlify.app",
        # Domain names for both MeshMemory.app and MeshMemory
        "https://MeshMemory.app",
        "https://*.MeshMemory.app",
        "https://meshmemory.xyz",
        "https://*.meshmemory.xyz",
        # Development with different ports
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Security
security = HTTPBearer(auto_error=False)

# Middleware for request logging and error handling
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = datetime.now()
    
    # Log request details
    logger.info(f"Request: {request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        
        # Log response details
        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Response: {response.status_code} - Duration: {duration:.3f}s")
        
        return response
        
    except Exception as e:
        # Log error with context
        duration = (datetime.now() - start_time).total_seconds()
        logger.error(f"Request failed: {request.method} {request.url.path} - Duration: {duration:.3f}s - Error: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Return a proper error response instead of crashing
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "error_type": str(type(e).__name__)}
        )

# Include routers with authentication
try:
    app.include_router(auth.router, prefix="", tags=["auth"])
    app.include_router(import_routes.router, prefix="", tags=["import"])
    app.include_router(conversations_router, prefix="", tags=["conversations"])
    app.include_router(chat_merge_router, prefix="", tags=["Chat Merge"])
    app.include_router(search.router, prefix="", tags=["search"])
    app.include_router(enhanced_search.router, prefix="", tags=["enhanced-search"])
    app.include_router(user_settings.router, prefix="", tags=["user-settings"])
    app.include_router(microchats.router, prefix="", tags=["microchats"])
    app.include_router(analytics.router, prefix="", tags=["analytics"])
    app.include_router(data_management.router, prefix="", tags=["data-management"])
    app.include_router(pagination.router, prefix="", tags=["pagination"])
    app.include_router(messages_router, prefix="", tags=["messages"])
except Exception as e:
    logger.error(f"Error including router: {str(e)}")
    traceback.print_exc()

@app.get("/")
async def root():
    return {"message": "MeshMemory API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    services = {}
    db_status = "unknown"
    cache_status = "unknown"
    supabase_status = "unknown"
    overall_status = "unknown"
    
    # Test database connection
    try:
        from api.services.database_service import DatabaseService
        db_service = DatabaseService()
        # Get Supabase client without doing an actual query first
        try:
            supabase_client = await db_service.get_connection()
            if supabase_client:
                supabase_status = "connected"
                # Now try a simple query to ensure it really works
                try:
                    # We can't do direct SQL queries with Supabase client, so check if we can access tables
                    result = supabase_client.table('sources').select('id').limit(1).execute()
                    db_status = "healthy"
                except Exception as query_err:
                    logger.error(f"Database query failed: {query_err}")
                    db_status = "connected_but_query_failed"
                    services["db_query_error"] = str(query_err)
            else:
                db_status = "connection_failed"
        except Exception as conn_err:
            logger.error(f"Database connection failed: {conn_err}")
            db_status = "connection_failed"
            services["db_connection_error"] = str(conn_err)
    except ImportError as import_err:
        logger.error(f"DatabaseService import failed: {import_err}")
        db_status = "import_failed"
        services["db_import_error"] = str(import_err)
    
    # Test cache connection
    try:
        from api.services.cache_service import CacheService
        cache_service = CacheService()
        cache_status = "healthy" if cache_service.enabled else "disabled"
    except Exception as cache_err:
        logger.error(f"Cache service error: {cache_err}")
        cache_status = "error"
        services["cache_error"] = str(cache_err)
    
    # Determine overall status
    if db_status == "healthy":
        overall_status = "healthy"
    elif db_status in ["connected", "connected_but_query_failed"]:
        overall_status = "partially_degraded"
    else:
        overall_status = "unhealthy"
        
    services["database"] = db_status
    services["cache"] = cache_status
    services["supabase"] = supabase_status
    
    response = {
        "status": overall_status,
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": services
    }
    
    # Add environment info for debugging
    if overall_status != "healthy":
        # Add sanitized environment info (no secrets)
        env_info = {
            "SUPABASE_URL_SET": "Yes" if os.getenv("SUPABASE_URL") else "No",
            "SUPABASE_KEY_SET": "Yes" if os.getenv("SUPABASE_SERVICE_KEY") else "No",
            "ENV_PATH": env_path,
            "ENV_EXISTS": os.path.exists(env_path)
        }
        response["environment"] = env_info
    
    return response

print("main.py executed successfully ✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
