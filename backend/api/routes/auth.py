from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from ..middleware.auth import supabase

router = APIRouter()
security = HTTPBearer()

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

@router.post("/auth/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    """
    Register a new user via Supabase
    """
    res = supabase.auth.sign_up({"email": req.email, "password": req.password})
    user = getattr(res, 'user', None)
    if not user:
        error = getattr(res, 'error', None)
        detail = error.message if hasattr(error, 'message') else str(error)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
    return {"id": user.id, "email": user.email}

@router.post("/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    """
    Authenticate user and return session tokens
    """
    res = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
    session = getattr(res, 'session', None)
    if not session:
        error = getattr(res, 'error', None)
        detail = error.message if hasattr(error, 'message') else str(error)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)
    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "expires_in": session.expires_in
    }

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
