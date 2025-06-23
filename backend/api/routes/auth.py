from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from ..models.schemas import UserCreate, UserLogin, TokenResponse, UserResponse, UserSession
from ..services.auth_service import AuthService, pwd_context

router = APIRouter()
security = HTTPBearer()
auth_service = AuthService()

# Request/Response Schemas
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class RegisterResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(TokenResponse):
    pass

class MeResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None

@router.post("/auth/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(user_credentials: RegisterRequest):
    """
    Register a new user.
    """
    try:
        user_session = await auth_service.register_user(
            UserCreate(
                email=user_credentials.email,
                password=user_credentials.password,
                full_name=user_credentials.full_name
            )
        )
        if user_session and user_session.user:
            return {
                "id": str(user_session.user.get("id")),
                "email": user_session.user.get("email"),
                "full_name": user_session.user.get("full_name")
            }
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not register user"
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/auth/login", response_model=LoginResponse)
async def login(user_credentials: LoginRequest):
    """
    Authenticate user and return a token.
    """
    try:
        user_session = await auth_service.login_user(
            UserLogin(
                email=user_credentials.email,
                password=user_credentials.password
            )
        )
        if user_session and user_session.session:
            return user_session.session
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/users/me", response_model=MeResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current user info using JWT token
    """
    try:
        token = credentials.credentials
        user = await auth_service.get_current_user(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return {
            "id": str(user.get("id")),
            "email": user.get("email"),
            "full_name": user.get("full_name")
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
