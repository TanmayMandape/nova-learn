from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserProfile(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "student"

class LectureBase(BaseModel):
    title: str
    transcript: Optional[str] = None
    summary: Optional[str] = None
    department: Optional[str] = None

class LectureCreate(BaseModel):
    title: str
    transcript: str
    department: Optional[str] = "Computer Science"

class Lecture(LectureBase):
    id: str
    created_at: datetime

class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    department: Optional[str] = None
    lecture_id: Optional[str] = None

class AssignmentCreate(BaseModel):
    title: str
    description: str
    questions: Optional[str] = None
    lecture_id: Optional[str] = None
    due_date: Optional[datetime] = None

class Assignment(AssignmentBase):
    id: str
    created_at: datetime

class SubmissionBase(BaseModel):
    assignment_id: str
    student_id: str
    content: str
    status: str = "submitted"
    grade: Optional[str] = None

class SubmissionCreate(BaseModel):
    assignment_id: str
    content: str

class Submission(SubmissionBase):
    id: str
    submitted_at: datetime

class ChatbotLogBase(BaseModel):
    student_id: str
    query: str
    response: str

class ChatbotLogCreate(BaseModel):
    query: str

class ChatbotLog(ChatbotLogBase):
    id: str
    timestamp: datetime
