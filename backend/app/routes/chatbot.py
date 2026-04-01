from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase
from app.services.ai_services import chatbot_response
from app.models.schemas import ChatbotLogCreate, ChatbotLog
from typing import List

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.post("/ask", response_model=ChatbotLog)
async def ask_chatbot(query_in: ChatbotLogCreate):
    # Get mock AI response
    response_text = chatbot_response(query_in.query)
    
    # Log to Supabase
    log_data = {
        "student_id": "mock-student-123",
        "query": query_in.query,
        "response": response_text,
        "timestamp": "now()"
    }
    
    try:
        response = supabase.table("chatbot_logs").insert(log_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[ChatbotLog])
async def get_chatbot_history():
    try:
        response = supabase.table("chatbot_logs").select("*").eq("student_id", "mock-student-123").order("timestamp", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
