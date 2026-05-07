from fastapi import APIRouter
from pydantic import BaseModel
from app.services.supabase_client import supabase
from typing import Optional
import datetime

router = APIRouter(prefix="/announcements", tags=["Announcements"])


class AnnouncementCreate(BaseModel):
    title: str
    message: str
    priority: str = "normal"
    author: str = "Faculty"


@router.post("/")
async def create_announcement(data: AnnouncementCreate):
    try:
        result = supabase.table("announcements").insert({
            "title": data.title,
            "message": data.message,
            "priority": data.priority,
            "author": data.author,
            "created_at": datetime.datetime.utcnow().isoformat(),
        }).execute()
        return {"success": True, "announcement": result.data[0] if result.data else {}}
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/")
async def get_announcements():
    try:
        result = supabase.table("announcements").select("*").order("created_at", desc=True).limit(20).execute()
        return {"announcements": result.data or []}
    except Exception as e:
        return {"announcements": [], "error": str(e)}
