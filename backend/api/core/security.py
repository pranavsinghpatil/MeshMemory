"""
Security utilities for handling JWT tokens and password hashing.
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY or SECRET_KEY == "your-secret-key-here":
    # In production, this will cause the application to fail if no secret key is set
    # which is better than using a default insecure key
    if os.getenv("ENVIRONMENT", "").lower() == "production":
        raise ValueError("JWT_SECRET environment variable must be set in production")
    # For development only, generate a random key
    import secrets
    SECRET_KEY = secrets.token_hex(32)
    print("WARNING: Using a randomly generated JWT secret key. This is only acceptable for development.")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new JWT access token."""
    to_encode = data.copy()
    
    # Set default token type if not specified
    if "type" not in to_encode:
        to_encode.update({"type": "access"})
    
    # Set issued at time for token
    to_encode.update({"iat": datetime.utcnow()})
    
    # Set token ID for potential revocation
    import uuid
    to_encode.update({"jti": str(uuid.uuid4())})
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_id: str) -> str:
    """Create a new JWT refresh token."""
    expires_delta = timedelta(days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7)))
    return create_access_token(
        data={"sub": str(user_id), "type": "refresh"},
        expires_delta=expires_delta
    )


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Get the current user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Validate token type and expiration
        token_type = payload.get("type")
        if token_type == "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not valid for authentication",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Check if token is about to expire and should be renewed
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.utcnow() + timedelta(minutes=5):
            # Mark token as needing refresh
            return {"user_id": user_id, "token": token, "needs_refresh": True}
            
        # Here you would typically fetch the user from your database
        # For now, we'll just return the user_id
        return {"user_id": user_id, "token": token, "needs_refresh": False}
    except JWTError:
        raise credentials_exception


async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get the current active user."""
    # Here you would typically check if the user is active in your database
    # For now, we'll just return the current user
    return current_user
