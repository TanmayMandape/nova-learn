import json
from fastapi import APIRouter, HTTPException, Query
from app.services.db import db
from app.services.ai_services import extract_keywords, generate_assignment_from_transcript
from app.models.schemas import AssignmentCreate, Assignment, SubmissionCreate, Submission, SubmissionGrade
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(tags=["Assignments"])


class KeywordRequest(BaseModel):
    transcript: str


class GenerateRequest(BaseModel):
    transcript: str
    title: str = "AI Generated Assignment"
    keywords: list = []
    classroom_id: Optional[str] = None


@router.post("/assignments/keywords")
async def get_keywords(req: KeywordRequest):
    keywords = extract_keywords(req.transcript)
    return {"keywords": keywords}


@router.post("/assignments/generate")
async def generate_ai_assignment(req: GenerateRequest):
    result = generate_assignment_from_transcript(req.transcript)
    questions_str = json.dumps(result)
    keywords_str = json.dumps(req.keywords if req.keywords else extract_keywords(req.transcript))

    return {
        "success": True,
        "title": req.title,
        "questions": questions_str,
        "questions_parsed": result,
        "keywords": req.keywords or []
    }


@router.post("/assignments/publish")
@router.post("/assignments")
async def publish_assignment(data: AssignmentCreate):
    questions_str = data.questions if isinstance(data.questions, str) else json.dumps(data.questions)
    keywords_str = data.keywords if isinstance(data.keywords, str) else json.dumps(data.keywords or [])

    saved = db.save_assignment(
        title=data.title,
        description=data.description or "AI-generated classroom assignment",
        questions=questions_str,
        keywords=keywords_str,
        classroom_id=data.classroom_id,
        author=data.author or "Faculty",
        due_date=data.due_date
    )
    return {"success": True, "assignment": saved}


@router.get("/assignments/published")
@router.get("/assignments")
async def get_published_assignments(classroom_id: Optional[str] = Query(None)):
    assignments = db.get_assignments(classroom_id=classroom_id)
    # Parse questions JSON if needed for client ease
    for a in assignments:
        if a.get("questions"):
            try:
                a["questions_parsed"] = json.loads(a["questions"])
            except Exception:
                a["questions_parsed"] = a["questions"]
        if a.get("keywords"):
            try:
                a["keywords_parsed"] = json.loads(a["keywords"])
            except Exception:
                a["keywords_parsed"] = [k.strip() for k in a["keywords"].split(",") if k.strip()]
    return {"assignments": assignments}


def auto_evaluate_mcq(questions_raw: str, answers: list) -> float:
    try:
        parsed = json.loads(questions_raw) if isinstance(questions_raw, str) else questions_raw
        mcqs = parsed.get("multiple_choice_questions", []) or parsed.get("mcq", [])
        if not mcqs or not answers:
            return 80.0  # Default base score if ungradable

        correct_count = 0
        total_mcq = len(mcqs)

        for i, q in enumerate(mcqs):
            correct_ans = q.get("answer") or q.get("ans")
            student_ans = None
            for ans in answers:
                if ans.get("question_index") == i or ans.get("q_index") == i:
                    student_ans = ans.get("answer")
                    break

            if student_ans is not None:
                # Compare string or index
                if str(student_ans).strip().lower() == str(correct_ans).strip().lower():
                    correct_count += 1
                elif isinstance(correct_ans, int) and (
                    str(student_ans).startswith(chr(65 + correct_ans)) or str(student_ans) == str(correct_ans)
                ):
                    correct_count += 1

        # Score out of 100 with base points for effort
        score = (correct_count / total_mcq) * 70 + 30
        return round(score, 1)
    except Exception:
        return 85.0


@router.post("/assignments/submit")
@router.post("/submissions")
async def submit_assignment(data: SubmissionCreate):
    assignment = db.get_assignment_by_id(data.assignment_id)
    auto_score = 85.0
    grade = "A"

    content_str = data.content if isinstance(data.content, str) else json.dumps(data.content)

    if assignment and assignment.get("questions"):
        try:
            answers_list = json.loads(content_str) if isinstance(content_str, str) else data.content
            if isinstance(answers_list, list):
                auto_score = auto_evaluate_mcq(assignment["questions"], answers_list)
                if auto_score >= 90:
                    grade = "A+"
                elif auto_score >= 80:
                    grade = "A"
                elif auto_score >= 70:
                    grade = "B"
                else:
                    grade = "C"
        except Exception:
            pass

    classroom_id = data.classroom_id or (assignment.get("classroom_id") if assignment else None)

    submission = db.save_submission(
        assignment_id=data.assignment_id,
        classroom_id=classroom_id,
        student_id=data.student_id,
        student_name=data.student_name or "Student",
        student_email=data.student_email or "student@university.edu",
        content=content_str,
        score=auto_score,
        grade=grade,
        feedback=f"Auto-evaluated: {grade} ({auto_score}%)"
    )

    return {"success": True, "submission": submission}


@router.get("/submissions")
async def get_submissions(
    classroom_id: Optional[str] = Query(None),
    assignment_id: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None)
):
    submissions = db.get_submissions(
        classroom_id=classroom_id,
        assignment_id=assignment_id,
        student_id=student_id
    )
    for s in submissions:
        if s.get("content"):
            try:
                s["content_parsed"] = json.loads(s["content"])
            except Exception:
                s["content_parsed"] = s["content"]
    return submissions


@router.post("/submissions/{submission_id}/grade")
async def grade_submission(submission_id: str, data: SubmissionGrade):
    updated = db.update_submission_grade(
        submission_id=submission_id,
        grade=data.grade,
        score=data.score,
        feedback=data.feedback or ""
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"success": True, "submission": updated}
