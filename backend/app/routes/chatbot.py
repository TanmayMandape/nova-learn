from fastapi import APIRouter, Query
from app.services.db import db
from app.services.ai_services import chatbot_response
from app.services.pdf_rag_service import get_vectorstore_for_classroom, format_docs
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class ChatRequest(BaseModel):
    query: str = ""
    question: str = ""
    classroom_id: Optional[str] = None
    student_id: Optional[str] = "demo-student"


def get_classroom_context(classroom_id: Optional[str], question: str) -> tuple[str, str]:
    context_parts = []
    classroom_name = ""

    if classroom_id:
        classroom = db.get_classroom_by_id(classroom_id)
        if classroom:
            classroom_name = classroom.get("name", "")

        # 1. Search vectorstore for course PDF materials
        vs = get_vectorstore_for_classroom(classroom_id)
        if vs:
            try:
                retriever = vs.as_retriever(search_kwargs={"k": 2})
                docs = retriever.invoke(question)
                if docs:
                    context_parts.append("--- Course Documents ---")
                    context_parts.append(format_docs(docs))
            except Exception:
                pass

        # 2. Get lectures recorded for this classroom
        lectures = db.get_lectures(classroom_id=classroom_id)
        if lectures:
            context_parts.append("--- Recent Lecture Transcripts & Summaries ---")
            for lec in lectures[:3]:
                title = lec.get("title", "Lecture")
                summary = lec.get("summary", "")
                transcript = (lec.get("transcript", "") or "")[:500]
                context_parts.append(f"Lecture: {title}\nSummary: {summary}\nTranscript Excerpt: {transcript}")

    # Fallback to general recent lectures if no classroom specified
    if not context_parts:
        recent = db.get_lectures()
        if recent:
            lec = recent[0]
            context_parts.append(f"Recent Lecture: {lec.get('title')}\n{lec.get('summary') or lec.get('transcript', '')[:600]}")

    return "\n\n".join(context_parts), classroom_name


@router.post("/ask")
async def ask_chatbot(req: ChatRequest):
    question = (req.query or req.question).strip()
    if not question:
        return {"query": "", "response": "Please type a question to ask your AI Classroom Assistant."}

    context, classroom_name = get_classroom_context(req.classroom_id, question)
    answer = chatbot_response(question=question, context=context, classroom_name=classroom_name)

    logged = db.save_chatbot_log(
        student_id=req.student_id or "demo-student",
        query=question,
        response=answer,
        classroom_id=req.classroom_id
    )

    return logged


@router.get("/history")
async def get_chatbot_history(
    student_id: Optional[str] = Query(None),
    classroom_id: Optional[str] = Query(None)
):
    history = db.get_chatbot_logs(student_id=student_id, classroom_id=classroom_id)
    return history
