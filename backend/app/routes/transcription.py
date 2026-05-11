from fastapi import APIRouter, Request

router = APIRouter()


@router.post("/transcribe")
async def transcribe_audio(request: Request):
    # Transcription is now handled by Web Speech API in the browser.
    # This endpoint is kept for compatibility but is no longer used.
    return {"transcript": "", "success": False, "error": "Use Web Speech API in browser"}
