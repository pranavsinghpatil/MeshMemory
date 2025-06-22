import os
from ..services.supabase_client import create_client, SupabaseClient as Client
from ..models.schemas import UserCreate, UserLogin
from fastapi import HTTPException

class AuthService:
    def __init__(self):
        self.supabase: Client = self._get_supabase_client()

    def _get_supabase_client(self) -> Client:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase URL and Key must be set in environment variables.")
        return create_client(supabase_url, supabase_key)

    async def register_user(self, user_credentials: UserCreate):
        try:
            user = self.supabase.from_('auth').insert({
                "email": user_credentials.email,
                "password": user_credentials.password,
            }).execute()
            return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def login_user(self, user_credentials: UserLogin):
        try:
            user = self.supabase.auth.sign_in_with_password({
                "email": user_credentials.email,
                "password": user_credentials.password,
            })
            return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e)) 