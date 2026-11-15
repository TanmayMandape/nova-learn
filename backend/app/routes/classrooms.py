import random
import string
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import ClassroomCreate, ClassroomJoin, Classroom, Enrollment
from app.services.db import db
from typing import List, Optional

router = APIRouter(prefix="/classrooms", tags=["Classrooms"])


def generate_unique_join_code() -> str:
    # 6-character uppercase alphanumeric code (e.g. CS301A, K9W2M4)
    for _ in range(10):
        chars = string.ascii_uppercase + string.digits
        code = "".join(random.choices(chars, k=6))
        # Ensure it doesn't collide
        if not db.get_classroom_by_code(code):
            return code
    # Fallback with timestamp
    return "".join(random.choices(string.ascii_uppercase, k=4)) + "".join(random.choices(string.digits, k=2))


@router.post("/", response_model=Classroom)
async def create_classroom(data: ClassroomCreate):
    code = generate_unique_join_code()
    classroom = db.create_classroom(
        name=data.name.strip(),
        subject=data.subject.strip(),
        description=data.description.strip(),
        faculty_id=data.faculty_id,
        faculty_email=data.faculty_email or "faculty@university.edu",
        code=code
    )
    return classroom


@router.get("/", response_model=List[Classroom])
async def list_classrooms(faculty_id: Optional[str] = Query(None)):
    classrooms = db.list_classrooms(faculty_id=faculty_id)
    return classrooms


@router.get("/{classroom_id}", response_model=Classroom)
async def get_classroom(classroom_id: str):
    classroom = db.get_classroom_by_id(classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    return classroom


@router.post("/join")
async def join_classroom(data: ClassroomJoin):
    cleaned_code = data.code.strip().upper()
    classroom = db.get_classroom_by_code(cleaned_code)
    if not classroom:
        raise HTTPException(
            status_code=404,
            detail=f"Classroom with code '{cleaned_code}' was not found. Please verify the code with your teacher."
        )

    enrollment = db.enroll_student(
        classroom_id=classroom["id"],
        student_id=data.student_id,
        student_name=data.student_name or data.student_email.split("@")[0].capitalize(),
        student_email=data.student_email
    )

    return {
        "success": True,
        "message": f"Successfully joined {classroom['name']}!",
        "classroom": classroom,
        "enrollment": enrollment
    }


@router.get("/enrolled/{student_id}", response_model=List[Classroom])
async def get_enrolled_classrooms(student_id: str):
    classrooms = db.get_enrolled_classrooms(student_id)
    return classrooms


@router.get("/{classroom_id}/students", response_model=List[Enrollment])
async def get_classroom_students(classroom_id: str):
    students = db.get_enrolled_students(classroom_id)
    return students


@router.get("/analytics/faculty/{faculty_id}")
async def get_faculty_analytics(faculty_id: str):
    return db.get_faculty_analytics(faculty_id)


@router.get("/analytics/student/{student_id}")
async def get_student_analytics(student_id: str):
    return db.get_student_analytics(student_id)


@router.get("/leaderboard/list")
async def get_leaderboard(classroom_id: Optional[str] = Query(None)):
    return db.get_leaderboard(classroom_id=classroom_id)
