from fastapi import APIRouter
from app.services.ai_services import chatbot_response
from pydantic import BaseModel

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class ChatRequest(BaseModel):
    query: str = ""
    question: str = ""


def _get_latest_transcript() -> str:
    try:
        from app.services.supabase_client import supabase
        result = supabase.table("lectures").select("transcript").order("created_at", desc=True).limit(1).execute()
        if result.data:
            return result.data[0].get("transcript", "")
    except Exception:
        pass
    return ""


@router.post("/ask")
async def ask_chatbot(req: ChatRequest):
    question = req.query or req.question
    transcript = _get_latest_transcript()
    answer = chatbot_response(question=question, transcript=transcript)

    # Try to log — never crash if DB fails
    try:
        from app.services.supabase_client import supabase
        response = supabase.table("chatbot_logs").insert({
            "student_id": "demo-student",
            "query": question,
            "response": answer,
        }).execute()
        if response.data:
            return response.data[0]
    except Exception as db_err:
        print(f"chatbot DB skip: {db_err}")

    return {
        "id": "local",
        "student_id": "demo-student",
        "query": question,
        "response": answer,
        "timestamp": None,
    }


@router.get("/history")
async def get_chatbot_history():
    try:
        from app.services.supabase_client import supabase
        response = supabase.table("chatbot_logs").select("*").order("timestamp", desc=True).limit(20).execute()
        return response.data
    except Exception:
        return []
