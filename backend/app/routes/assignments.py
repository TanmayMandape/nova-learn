from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase
from app.models.schemas import AssignmentCreate, Assignment, SubmissionCreate, Submission
from typing import List

router = APIRouter(tags=["Assignments"])

@router.post("/assignments", response_model=Assignment)
async def create_assignment(assignment_in: AssignmentCreate):
    assignment_data = {
        "title": assignment_in.title,
        "description": assignment_in.description,
        "questions": assignment_in.questions,
        "lecture_id": assignment_in.lecture_id,
        "due_date": assignment_in.due_date if assignment_in.due_date else "now()"
    }
    
    try:
        response = supabase.table("assignments").insert(assignment_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assignments", response_model=List[Assignment])
async def get_assignments():
    try:
        response = supabase.table("assignments").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submissions", response_model=Submission)
async def create_submission(submission_in: SubmissionCreate):
    submission_data = {
        "assignment_id": submission_in.assignment_id,
        "student_id": "mock-student-123",
        "content": submission_in.content,
        "status": "submitted",
        "submitted_at": "now()"
    }
    
    try:
        response = supabase.table("submissions").insert(submission_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/submissions", response_model=List[Submission])
async def get_submissions():
    try:
        # Students see their own, faculty see all? 
        # For now, keep it simple as requested.
        response = supabase.table("submissions").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
