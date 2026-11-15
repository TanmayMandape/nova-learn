from fastapi import APIRouter, Query
from app.services.db import db
from app.models.schemas import AnnouncementCreate, Announcement
from typing import List, Optional

router = APIRouter()


@router.post("/", response_model=dict)
async def create_announcement(data: AnnouncementCreate):
    announcement = db.save_announcement(
        title=data.title,
        message=data.message,
        author=data.author or "Faculty",
        classroom_id=data.classroom_id
    )
    return {"success": True, "announcement": announcement}


@router.get("/")
async def get_announcements(
    classroom_id: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None)
):
    if student_id:
        enrolled_classrooms = db.get_enrolled_classrooms(student_id)
        enrolled_ids = [c["id"] for c in enrolled_classrooms]
        if not enrolled_ids:
            return {"announcements": []}

        if classroom_id:
            if classroom_id in enrolled_ids:
                announcements = db.get_announcements(classroom_id=classroom_id)
            else:
                announcements = []
        else:
            announcements = db.get_announcements(classroom_ids=enrolled_ids)
    else:
        announcements = db.get_announcements(classroom_id=classroom_id)

    return {"announcements": announcements}
