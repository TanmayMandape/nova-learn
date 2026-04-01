from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase
from app.services.ai_services import generate_notes
from app.models.schemas import LectureCreate, Lecture
from typing import List

router = APIRouter(prefix="/lectures", tags=["Lectures"])

@router.post("/", response_model=Lecture)
async def create_lecture(lecture_in: LectureCreate):
    # Generate summary/notes using AI service
    summary = generate_notes(lecture_in.transcript)
    
    # Save to Supabase
    lecture_data = {
        "title": lecture_in.title,
        "transcript": lecture_in.transcript,
        "summary": summary,
        "department": lecture_in.department,
        "created_at": "now()"
    }
    
    try:
        response = supabase.table("lectures").insert(lecture_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to insert lecture record")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Lecture])
async def get_lectures():
    try:
        response = supabase.table("lectures").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
