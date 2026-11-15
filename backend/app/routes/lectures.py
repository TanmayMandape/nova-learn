from fastapi import APIRouter, Query
from app.services.db import db
from app.services.ai_services import generate_notes
from app.models.schemas import LectureCreate, Lecture
from typing import List, Optional

router = APIRouter(prefix="/lectures", tags=["Lectures"])


@router.post("/", response_model=Lecture)
async def create_lecture(lecture_in: LectureCreate):
    try:
        notes = generate_notes(lecture_in.transcript)
    except Exception as e:
        notes = f"Notes unavailable: {str(e)}"

    saved = db.save_lecture(
        title=lecture_in.title,
        transcript=lecture_in.transcript,
        summary=notes,
        classroom_id=lecture_in.classroom_id,
        department=lecture_in.department or "Computer Science"
    )
    return saved


@router.get("/", response_model=List[Lecture])
async def get_lectures(classroom_id: Optional[str] = Query(None)):
    lectures = db.get_lectures(classroom_id=classroom_id)
    return lectures
