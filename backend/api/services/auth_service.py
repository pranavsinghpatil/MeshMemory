import os
import jwt
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from ..services.supabase_client import create_client, SupabaseClient as Client
from ..models.schemas import UserCreate, UserLogin, UserSession
from fastapi import HTTPException, status
from ..core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, SECRET_KEY, ALGORITHM
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting settings
from collections import defaultdict
from threading import Lock

# Simple in-memory rate limiter for login attempts
class LoginRateLimiter:
    def __init__(self, max_attempts=5, window_seconds=300):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.attempts = defaultdict(list)
        self.lock = Lock()
    
    def is_rate_limited(self, ip_address):
        with self.lock:
            now = time.time()
            # Remove old attempts
            self.attempts[ip_address] = [t for t in self.attempts[ip_address] 
                                       if now - t < self.window_seconds]
            # Check if rate limited
            if len(self.attempts[ip_address]) >= self.max_attempts:
                return True
            # Add new attempt
            self.attempts[ip_address].append(now)
            return False

# Initialize rate limiter
login_rate_limiter = LoginRateLimiter()

class AuthService:
    def __init__(self):
        self.supabase: Client = self._get_supabase_client()

    def _get_supabase_client(self) -> Client:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase URL and Key must be set in environment variables.")
        return create_client(supabase_url, supabase_key)

    async def register_user(self, user_credentials: UserCreate) -> UserSession:
        """Register a new user."""
        try:
            # Check if user already exists
            existing_user = await self.supabase.from_('users').select('*').eq('email', user_credentials.email).execute()
            
            if existing_user and len(existing_user.data) > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Hash the password using the imported function
            hashed_password = get_password_hash(user_credentials.password)
            
            # Create user in the database
            user_data = {
                "email": user_credentials.email,
                "hashed_password": hashed_password,
                "full_name": user_credentials.full_name or "",
                "is_active": True,
                "is_superuser": False
            }
            
            result = await self.supabase.from_('users').insert(user_data).execute()
            
            if not result or not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Could not create user"
                )
            
            # Create a session
            user = result.data[0]
            tokens = self.generate_tokens(user["email"])
            
            return UserSession(
                user=user,
                session={
                    **tokens,
                    "expires_in": 60 * 30  # 30 minutes in seconds
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error registering user: {str(e)}"
            )

    def generate_tokens(self, user_email: str) -> dict:
        """Generate access and refresh tokens."""
        # Use the imported create_access_token from security.py
        access_token = create_access_token(
            data={"sub": user_email, "type": "access"}
        )
        
        # Generate a refresh token
        refresh_token = create_refresh_token(user_email)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email."""
        result = await self.supabase.from_('users').select('*').eq('email', email).execute()
        if result and result.data and len(result.data) > 0:
            return result.data[0]
        return None

    async def login_user(self, user_credentials: UserLogin, client_ip: str = None) -> UserSession:
        """Authenticate a user and return a session."""
        try:
            # Apply rate limiting if IP is provided
            if client_ip and login_rate_limiter.is_rate_limited(client_ip):
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many login attempts. Please try again later."
                )
                
            # Get user from database
            user = await self.get_user_by_email(user_credentials.email)
            if not user:
                # Use a consistent error message to prevent user enumeration
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
            
            # Verify password using the imported function
            if not verify_password(user_credentials.password, user["hashed_password"]):
                logger.warning(f"Failed login attempt for email: {user_credentials.email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
            
            # Generate tokens
            tokens = self.generate_tokens(user["email"])
            
            return UserSession(
                user=user,
                session={
                    **tokens,
                    "expires_in": 60 * 30  # 30 minutes in seconds
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error during login: {str(e)}"
            )
    
    async def get_current_user(self, token: str) -> Dict[str, Any]:
        """Get the current user from a JWT token."""
        try:
            # Check for token type before decoding to prevent timing attacks
            if not token or not isinstance(token, str):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials"
                )
                
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Verify token type is 'access'
            token_type = payload.get("type")
            if token_type != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
                
            email: str = payload.get("sub")
            if email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials"
                )
            
            user = await self.get_user_by_email(email)
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            return user
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )