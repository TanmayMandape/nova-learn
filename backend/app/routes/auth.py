import hashlib
from fastapi import APIRouter, Header, HTTPException, Query, Body
from app.models.schemas import UserProfile
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])


class DemoLoginRequest(BaseModel):
    email: str
    password: str
    role: str = "student"


def generate_demo_user_id(email: str, role: str) -> str:
    cleaned = email.strip().lower()
    prefix = "fac" if role == "faculty" or role == "admin" else "stu"
    hashed = hashlib.md5(cleaned.encode()).hexdigest()[:8]
    return f"{prefix}_{hashed}"


def format_full_name(email: str, role: str) -> str:
    username = email.split("@")[0].replace(".", " ").replace("_", " ").title()
    if role == "faculty" or role == "admin":
        return f"Prof. {username}"
    return username


@router.post("/login", response_model=UserProfile)
async def demo_login(req: DemoLoginRequest):
    email = req.email.strip()
    if "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    if not req.password:
        raise HTTPException(status_code=400, detail="Password cannot be empty")

    normalized_role = "faculty" if req.role in ("faculty", "admin") else "student"
    user_id = generate_demo_user_id(email, normalized_role)
    full_name = format_full_name(email, normalized_role)

    return UserProfile(
        id=user_id,
        email=email,
        full_name=full_name,
        role=normalized_role,
    )


@router.get("/user", response_model=UserProfile)
async def get_user_profile(
    email: Optional[str] = Query(None),
    role: str = Query("student")
):
    normalized_role = "faculty" if role in ("faculty", "admin") else "student"
    safe_email = email or ("faculty@university.edu" if normalized_role == "faculty" else "student@university.edu")
    user_id = generate_demo_user_id(safe_email, normalized_role)
    full_name = format_full_name(safe_email, normalized_role)

    return UserProfile(
        id=user_id,
        email=safe_email,
        full_name=full_name,
        role=normalized_role
    )
