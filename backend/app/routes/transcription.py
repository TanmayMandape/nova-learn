from fastapi import APIRouter, UploadFile, File
import google.generativeai as genai
import os
import base64
import time

router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    for attempt in range(3):
        try:
            audio_bytes = await audio.read()
            audio_b64 = base64.b64encode(audio_bytes).decode()
            model = genai.GenerativeModel("gemini-2.0-flash-lite")
            response = model.generate_content([
                {
                    "inline_data": {
                        "mime_type": "audio/webm",
                        "data": audio_b64,
                    }
                },
                "Transcribe this audio accurately. The speaker may use English, Hindi, or Marathi or mix languages. Return only the transcript text, nothing else.",
            ])
            return {"transcript": response.text, "success": True}
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                time.sleep(15)
                continue
            return {"transcript": "", "success": False, "error": str(e)}
    return {"transcript": "", "success": False, "error": "AI quota exceeded. Try in 1 minute."}
