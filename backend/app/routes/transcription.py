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
            print(f"Audio received: {len(audio_bytes)} bytes")
            print(f"File content type: {audio.content_type}")

            if len(audio_bytes) == 0:
                return {"transcript": "", "success": False, "error": "Empty audio file"}

            audio_b64 = base64.b64encode(audio_bytes).decode()
            print(f"Base64 length: {len(audio_b64)}")

            model = genai.GenerativeModel("gemini-2.0-flash-lite")
            response = model.generate_content([
                {
                    "inline_data": {
                        "mime_type": "audio/webm;codecs=opus",
                        "data": audio_b64,
                    }
                },
                "Transcribe this audio. Return only the spoken words as plain text.",
            ])

            print(f"Gemini response: {response.text}")

            if not response.text or response.text.strip() == "":
                return {"transcript": "", "success": False, "error": "Gemini returned empty"}

            return {"transcript": response.text, "success": True}

        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if "429" in str(e) and attempt < 2:
                time.sleep(15)
                continue
            return {"transcript": "", "success": False, "error": str(e)}

    return {"transcript": "", "success": False, "error": "All attempts failed"}
