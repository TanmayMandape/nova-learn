import json
from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase
from app.services.ai_services import extract_keywords, generate_assignment_from_transcript
from app.models.schemas import AssignmentCreate, Assignment, SubmissionCreate, Submission
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(tags=["Assignments"])

# In-memory store for published assignments
published_assignments = []


class KeywordRequest(BaseModel):
    transcript: str


class GenerateRequest(BaseModel):
    transcript: str
    title: str = "AI Generated Assignment"
    keywords: list = []


@router.post("/assignments/keywords")
async def get_keywords(req: KeywordRequest):
    keywords = extract_keywords(req.transcript)
    return {"keywords": keywords}


@router.post("/assignments/generate")
async def generate_ai_assignment(req: GenerateRequest):
    result = generate_assignment_from_transcript(req.transcript)
    questions_str = json.dumps(result)

    assignment_data = {
        "title": req.title,
        "description": "AI-generated assignment.",
        "questions": questions_str,
    }

    try:
        response = supabase.table("assignments").insert(assignment_data).execute()
        saved = response.data[0] if response.data else {}
        saved["questions_parsed"] = result
        return saved
    except Exception as db_err:
        return {"success": True, "questions": questions_str, "questions_parsed": result}


@router.post("/assignments", response_model=Assignment)
async def create_assignment(assignment_in: AssignmentCreate):
    assignment_data = {
        "title": assignment_in.title,
        "description": assignment_in.description,
        "questions": assignment_in.questions,
        "lecture_id": assignment_in.lecture_id,
    }
    try:
        response = supabase.table("assignments").insert(assignment_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assignments")
async def get_assignments():
    try:
        response = supabase.table("assignments").select("*").execute()
        return response.data
    except Exception:
        return []


@router.post("/submissions")
async def create_submission(submission_in: SubmissionCreate):
    submission_data = {
        "assignment_id": submission_in.assignment_id,
        "student_id": "demo-student",
        "content": submission_in.content,
        "status": "submitted",
    }
    try:
        response = supabase.table("submissions").insert(submission_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/submissions")
async def get_submissions():
    try:
        response = supabase.table("submissions").select("*").execute()
        return response.data
    except Exception:
        return []


@router.post("/assignments/publish")
async def publish_assignment(data: dict):
    assignment = {
        "id": len(published_assignments) + 1,
        "title": data.get("title", "Assignment"),
        "questions": data.get("questions", []),
        "keywords": data.get("keywords", []),
        "author": data.get("author", "Faculty"),
        "created_at": datetime.utcnow().strftime("%d %b %Y, %I:%M %p"),
    }
    published_assignments.append(assignment)
    return {"success": True, "assignment": assignment}


@router.get("/assignments/published")
async def get_published_assignments():
    return {"assignments": list(reversed(published_assignments))}
