from fastapi import APIRouter
from app.services.supabase_client import supabase
from app.services.ai_services import generate_notes
from app.models.schemas import LectureCreate
from typing import List
import uuid
from datetime import datetime

router = APIRouter(prefix="/lectures", tags=["Lectures"])

# In-memory fallback store — survives within a single Render instance session
_lecture_cache: List[dict] = []


@router.post("/")
async def create_lecture(lecture_in: LectureCreate):
    try:
        notes = generate_notes(lecture_in.transcript)
    except Exception as e:
        notes = f"Notes unavailable: {str(e)}"

    lecture_data = {
        "title": lecture_in.title,
        "transcript": lecture_in.transcript,
        "summary": notes,
        "department": lecture_in.department or "Computer Science",
    }

    # Try Supabase first
    try:
        response = supabase.table("lectures").insert(lecture_data).execute()
        if response.data:
            saved = response.data[0]
            _lecture_cache.insert(0, saved)  # also cache it
            return saved
    except Exception as db_error:
        print(f"DB save failed (using cache): {db_error}")

    # Supabase failed — save to in-memory cache so student can still see it
    fallback = {
        "id": str(uuid.uuid4()),
        "title": lecture_in.title,
        "transcript": lecture_in.transcript,
        "summary": notes,
        "department": lecture_in.department or "Computer Science",
        "created_at": datetime.utcnow().isoformat(),
    }
    _lecture_cache.insert(0, fallback)
    return fallback


@router.get("/")
async def get_lectures():
    # Try Supabase first
    try:
        response = supabase.table("lectures").select("*").order("created_at", desc=True).execute()
        if response.data:
            # Merge DB results with cache (DB wins for duplicates)
            db_ids = {r["id"] for r in response.data}
            extra = [c for c in _lecture_cache if c["id"] not in db_ids]
            return response.data + extra
    except Exception as e:
        print(f"DB read failed (using cache): {e}")

    # Return cache if DB unavailable
    return _lecture_cache
