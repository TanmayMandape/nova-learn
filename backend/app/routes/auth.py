from fastapi import APIRouter, Header, HTTPException, Depends
from app.services.supabase_client import supabase
from app.models.schemas import UserProfile
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Auth"])

async def get_current_user(authorization: Optional[str] = Header(None)):
    # Mock user for internal consistency
    return {"id": "mock-user-123", "email": "demo@example.com"}

@router.get("/user", response_model=UserProfile)
async def get_user_profile(role: str = "student"):
    # Return a static mock profile based on the role parameter
    # This allows the frontend to navigate to the correct dashboard after 'login'
    return UserProfile(
        id="mock-user-123", 
        email="demo@example.com", 
        role=role,
        full_name="Demo User"
    )
