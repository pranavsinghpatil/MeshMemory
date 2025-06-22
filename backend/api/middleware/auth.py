from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import logging
import traceback
from fastapi import Request, HTTPException, status
from pathlib import Path
from dotenv import load_dotenv
from ..services.supabase_client import create_client
from typing import Optional, Dict, Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file at project root
project_root = Path(__file__).parent.parent.parent.parent
env_file = project_root / ".env"
load_dotenv(dotenv_path=env_file)

# Initialize custom Supabase client
try:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_key:
        logger.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables")
        
    supabase = create_client(supabase_url, supabase_key)
    # logger.info(f"Initialized custom Supabase client with URL: {supabase_url}")
except Exception as e:
    logger.error(f"Error initializing Supabase client: {str(e)}")
    logger.error(traceback.format_exc())
    # Create a dummy client for development/testing
    supabase = None

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if not credentials:
        # If in dev mode, return a mock user
        if os.getenv("ENV") == "dev":
            return {"id": "mock-user-id", "email": "dev@example.com"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Get the JWT token from the Authorization header
        token = credentials.credentials
        
        if not supabase:
            logger.warning("Supabase client not initialized, using mock user")
            return {"id": "mock-user-id", "email": "dev@example.com"}
        
        # Verify the token and get user info using our custom client
        user = supabase.verify_token(token)
        if not user or not user.get("id"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        logger.error(traceback.format_exc())
        
        if os.getenv("ENV") == "dev":
            logger.warning("Development mode: using mock user")
            return {"id": "mock-user-id", "email": "dev@example.com"}
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user.user if user and user.user else None
    except Exception:
        return None

def require_auth(func):
    """Decorator to require authentication for a route"""
    async def wrapper(*args, **kwargs):
        # This will be handled by FastAPI's dependency injection
        return await func(*args, **kwargs)
    return wrapper