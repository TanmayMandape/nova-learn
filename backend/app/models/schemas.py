from pydantic import BaseModel, Field
from typing import Optional, List, Any, Union
from datetime import datetime


# ── User Profile ─────────────────────────────────────────────────────────────
class UserProfile(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "student"


# ── Classroom Models ─────────────────────────────────────────────────────────
class ClassroomCreate(BaseModel):
    name: str
    subject: str
    description: Optional[str] = ""
    faculty_id: str
    faculty_email: Optional[str] = "faculty@university.edu"


class ClassroomJoin(BaseModel):
    code: str
    student_id: str
    student_name: Optional[str] = "Student"
    student_email: Optional[str] = "student@university.edu"


class Classroom(BaseModel):
    id: str
    name: str
    code: str
    subject: str
    description: Optional[str] = ""
    faculty_id: str
    faculty_email: Optional[str] = None
    created_at: str


class Enrollment(BaseModel):
    id: str
    classroom_id: str
    student_id: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    enrolled_at: str


# ── Course Material Models ───────────────────────────────────────────────────
class CourseMaterial(BaseModel):
    id: str
    classroom_id: str
    title: str
    filename: str
    file_path: Optional[str] = None
    doc_type: str = "pdf"
    pages: int = 0
    chunks: int = 0
    created_at: str


# ── Lecture Models ───────────────────────────────────────────────────────────
class LectureBase(BaseModel):
    title: str
    transcript: Optional[str] = None
    summary: Optional[str] = None
    department: Optional[str] = "Computer Science"
    classroom_id: Optional[str] = None


class LectureCreate(BaseModel):
    title: str
    transcript: str
    classroom_id: Optional[str] = None
    department: Optional[str] = "Computer Science"


class Lecture(LectureBase):
    id: str
    created_at: str


# ── Assignment Models ────────────────────────────────────────────────────────
class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    questions: Union[str, dict, list]
    keywords: Optional[Union[str, list]] = ""
    classroom_id: Optional[str] = None
    due_date: Optional[str] = None
    author: Optional[str] = "Faculty"


class Assignment(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    questions: Optional[str] = None
    keywords: Optional[str] = None
    classroom_id: Optional[str] = None
    due_date: Optional[str] = None
    status: str = "published"
    author: Optional[str] = "Faculty"
    created_at: str


# ── Submission Models ────────────────────────────────────────────────────────
class SubmissionCreate(BaseModel):
    assignment_id: str
    classroom_id: Optional[str] = None
    student_id: str
    student_name: Optional[str] = "Student"
    student_email: Optional[str] = "student@university.edu"
    content: Union[str, dict, list]
    score: Optional[float] = 0


class SubmissionGrade(BaseModel):
    grade: str
    score: float
    feedback: Optional[str] = ""


class Submission(BaseModel):
    id: str
    assignment_id: str
    classroom_id: Optional[str] = None
    student_id: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    content: str
    status: str = "submitted"
    grade: Optional[str] = None
    score: float = 0
    feedback: Optional[str] = None
    submitted_at: str


# ── Chatbot Log Models ───────────────────────────────────────────────────────
class ChatbotLogCreate(BaseModel):
    query: Optional[str] = ""
    question: Optional[str] = ""
    classroom_id: Optional[str] = None
    student_id: Optional[str] = "student"


class ChatbotLog(BaseModel):
    id: str
    classroom_id: Optional[str] = None
    student_id: str
    query: str
    response: str
    timestamp: str


# ── Announcement Models ──────────────────────────────────────────────────────
class AnnouncementCreate(BaseModel):
    title: str
    message: str
    classroom_id: Optional[str] = None
    author: Optional[str] = "Faculty"


class Announcement(BaseModel):
    id: str
    classroom_id: Optional[str] = None
    title: str
    message: str
    author: str
    created_at: str
