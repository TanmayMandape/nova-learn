from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase
from app.services.ai_services import generate_notes
from app.models.schemas import LectureCreate, Lecture
from typing import List

router = APIRouter(prefix="/lectures", tags=["Lectures"])


@router.post("/")
async def create_lecture(lecture_in: LectureCreate):
    try:
        notes = generate_notes(lecture_in.transcript)
    except Exception as e:
        return {"success": False, "error": f"AI error: {str(e)}"}

    try:
        response = supabase.table("lectures").insert({
            "title": lecture_in.title,
            "transcript": lecture_in.transcript,
            "summary": notes,
            "department": lecture_in.department or "Computer Science",
        }).execute()
        return response.data[0] if response.data else {
            "success": True, "notes": notes, "transcript": lecture_in.transcript
        }
    except Exception as db_error:
        print(f"DB save failed: {db_error}")
        return {"success": True, "notes": notes, "transcript": lecture_in.transcript}


@router.get("/")
async def get_lectures():
    try:
        response = supabase.table("lectures").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        return []
