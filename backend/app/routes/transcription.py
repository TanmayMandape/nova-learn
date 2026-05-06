from fastapi import APIRouter, UploadFile, File
from google import genai
from google.genai import types
import base64
import os

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type="audio/webm"),
                "Transcribe this audio. Speaker may use English, Hindi or Marathi. Return only transcript text.",
            ],
        )
        return {"transcript": response.text}
    except Exception as e:
        return {"transcript": "", "error": str(e)}
