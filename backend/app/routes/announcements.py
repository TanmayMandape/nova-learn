from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from typing import List

router = APIRouter()

# In-memory storage - no database needed
announcements_store = []


class Announcement(BaseModel):
    title: str
    message: str
    author: str = "Faculty"


@router.post("/")
async def create_announcement(data: Announcement):
    announcement = {
        "id": len(announcements_store) + 1,
        "title": data.title,
        "message": data.message,
        "author": data.author,
        "created_at": datetime.utcnow().strftime("%d %b %Y, %I:%M %p"),
    }
    announcements_store.append(announcement)
    return {"success": True, "announcement": announcement}


@router.get("/")
async def get_announcements():
    return {"announcements": list(reversed(announcements_store))}
