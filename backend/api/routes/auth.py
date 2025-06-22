from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from ..middleware.auth import supabase
from ..models.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from ..services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()
auth_service = AuthService()

# Request/Response Schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterResponse(BaseModel):
    id: str
    email: EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "bearer"

class MeResponse(BaseModel):
    id: str
    email: EmailStr

@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_credentials: UserCreate):
    """
    Register a new user.
    """
    user_session = await auth_service.register_user(user_credentials)
    if user_session and user_session.user:
        return {"id": user_session.user.id, "email": user_session.user.email}
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not register user")

@router.post("/auth/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """
    Authenticate user and return a token.
    """
    user_session = await auth_service.login_user(user_credentials)
    if user_session and user_session.session:
        return {
            "access_token": user_session.session.access_token,
            "refresh_token": user_session.session.refresh_token,
            "expires_in": user_session.session.expires_in,
            "token_type": "bearer"
        }
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@router.get("/users/me", response_model=MeResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current user info from Supabase using Bearer token
    """
    token = credentials.credentials
    res = supabase.auth.get_user(token)
    user = getattr(res, 'user', None)
    if not user:
        error = getattr(res, 'error', None)
        detail = error.message if hasattr(error, 'message') else str(error)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)
    return {"id": user.id, "email": user.email}
