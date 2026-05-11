from fastapi import APIRouter, Request
import google.generativeai as genai
import os
import base64
import time

router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


@router.post("/transcribe")
async def transcribe_audio(request: Request):
    try:
        form = await request.form()
        print(f"Form fields: {list(form.keys())}")

        # Try both field names — frontend sends "audio", some clients send "file"
        audio_file = form.get("audio") or form.get("file")

        if audio_file is None:
            print("No audio/file field found in form")
            return {"transcript": "", "success": False, "error": "No file in request. Expected field name: audio"}

        audio_bytes = await audio_file.read()
        print(f"Audio bytes after form read: {len(audio_bytes)}")

        if len(audio_bytes) == 0:
            return {"transcript": "", "success": False, "error": "Empty audio file"}

        audio_b64 = base64.b64encode(audio_bytes).decode()

        for attempt in range(3):
            try:
                model = genai.GenerativeModel("gemini-2.0-flash")
                response = model.generate_content([
                    {
                        "inline_data": {
                            "mime_type": "audio/webm",
                            "data": audio_b64,
                        }
                    },
                    "Transcribe this audio. Return only the spoken words as plain text.",
                ])
                print(f"Gemini response: {response.text[:100]}")
                return {"transcript": response.text, "success": True}
            except Exception as e:
                print(f"Gemini attempt {attempt + 1} failed: {str(e)}")
                if "429" in str(e) and attempt < 2:
                    time.sleep(15)
                    continue
                return {"transcript": "", "success": False, "error": str(e)}

    except Exception as e:
        print(f"Request parsing failed: {str(e)}")
        return {"transcript": "", "success": False, "error": str(e)}
