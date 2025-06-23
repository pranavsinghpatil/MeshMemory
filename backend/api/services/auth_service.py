import os
import jwt
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from ..services.supabase_client import create_client, SupabaseClient as Client
from ..models.schemas import UserCreate, UserLogin, UserSession
from fastapi import HTTPException, status
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
            
            # Hash the password
            hashed_password = pwd_context.hash(user_credentials.password)
            
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
            access_token = self.create_access_token(data={"sub": user["email"]})
            
            return UserSession(
                user=user,
                session={
                    "access_token": access_token,
                    "refresh_token": "",  # Implement refresh tokens if needed
                    "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                    "token_type": "bearer"
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error registering user: {str(e)}"
            )

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get a user by email."""
        result = await self.supabase.from_('users').select('*').eq('email', email).execute()
        if result and result.data and len(result.data) > 0:
            return result.data[0]
        return None

    async def login_user(self, user_credentials: UserLogin) -> UserSession:
        """Authenticate a user and return a session."""
        try:
            # Get user from database
            user = await self.get_user_by_email(user_credentials.email)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
            
            # Verify password
            if not pwd_context.verify(user_credentials.password, user["hashed_password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password"
                )
            
            # Create access token
            access_token = self.create_access_token(
                data={"sub": user["email"]}
            )
            
            return UserSession(
                user=user,
                session={
                    "access_token": access_token,
                    "refresh_token": "",  # Implement refresh tokens if needed
                    "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                    "token_type": "bearer"
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
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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