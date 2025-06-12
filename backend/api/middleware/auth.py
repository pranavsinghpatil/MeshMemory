from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import os
from typing import Optional

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase configuration")

supabase: Client = create_client(supabase_url, supabase_key)

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    """Get current authenticated user from JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Verify the JWT token with Supabase
        user = supabase.auth.get_user(credentials.credentials)
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
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