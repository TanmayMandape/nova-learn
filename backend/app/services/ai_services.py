import json
import os
from google import genai

def _client():
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemini-2.0-flash-lite"


def generate_notes(transcript: str) -> str:
    try:
        client = _client()
        response = client.models.generate_content(
            model=MODEL,
            contents=(
                "You are a teaching assistant. Summarize this lecture transcript into "
                "clear structured notes with key concepts and bullet points. "
                "Keep response under 300 words.\n\nTranscript: " + transcript
            ),
        )
        return response.text
    except Exception as e:
        return f"Notes generation failed: {str(e)}"


def extract_keywords(transcript: str) -> list:
    try:
        client = _client()
        response = client.models.generate_content(
            model=MODEL,
            contents=(
                'Extract 10 most important keywords from this lecture transcript. '
                'Return ONLY a JSON array like: ["keyword1", "keyword2"]. '
                'Transcript: ' + transcript
            ),
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception as e:
        return ["keyword1", "keyword2", str(e)[:30]]


def generate_assignment_from_transcript(transcript: str) -> dict:
    try:
        client = _client()
        response = client.models.generate_content(
            model=MODEL,
            contents=(
                f"Given this lecture transcript: {transcript}\n\n"
                "Generate exactly 10 questions: 5 MCQs (each with 4 options, mark correct answer) "
                "and 5 short answer questions. "
                "Return ONLY valid JSON in this exact format: "
                '{"multiple_choice_questions": [{"question": "...", "options": ["a","b","c","d"], "answer": "..."}], '
                '"short_answer_questions": [{"question": "..."}]}'
            ),
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception as e:
        return {"error": str(e), "multiple_choice_questions": [], "short_answer_questions": []}


def chatbot_response(question: str, transcript: str = "") -> str:
    try:
        client = _client()
        response = client.models.generate_content(
            model=MODEL,
            contents=(
                "You are a classroom assistant. Answer ONLY from this transcript. "
                "If the answer is not in the transcript say: This was not covered in the lecture.\n\n"
                f"Transcript: {transcript}\n\nQuestion: {question}"
            ),
        )
        return response.text
    except Exception as e:
        return f"AI error: {str(e)}"
