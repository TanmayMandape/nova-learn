import json
import os
from google import genai

MODEL = "gemini-2.0-flash-lite"

def _client():
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def _call(prompt: str) -> str:
    try:
        client = _client()
        response = client.models.generate_content(model=MODEL, contents=prompt)
        return response.text
    except Exception as e:
        err = str(e)
        if "429" in err or "EXHAUSTED" in err or "quota" in err.lower():
            return "AI quota limit hit. Please wait 1 minute and try again."
        return f"AI error. Please try again. ({err[:80]})"


def generate_notes(transcript: str) -> str:
    return _call(
        "You are a teaching assistant. Summarize this lecture transcript into "
        "clear structured notes with key concepts and bullet points. "
        "Keep response under 300 words.\n\nTranscript: " + transcript
    )


def extract_keywords(transcript: str) -> list:
    raw = _call(
        'Extract 10 most important keywords from this lecture transcript. '
        'Return ONLY a JSON array like: ["keyword1", "keyword2"]. '
        'Transcript: ' + transcript
    )
    if "quota" in raw.lower() or "AI error" in raw:
        return [raw]
    try:
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception:
        return [w.strip() for w in transcript.split()[:10]]


def generate_assignment_from_transcript(transcript: str) -> dict:
    raw = _call(
        f"Given this lecture transcript: {transcript}\n\n"
        "Generate exactly 10 questions: 5 MCQs (each with 4 options, mark correct answer) "
        "and 5 short answer questions. "
        "Return ONLY valid JSON in this exact format: "
        '{"multiple_choice_questions": [{"question": "...", "options": ["a","b","c","d"], "answer": "..."}], '
        '"short_answer_questions": [{"question": "..."}]}'
    )
    if "quota" in raw.lower() or "AI error" in raw:
        return {"error": raw, "multiple_choice_questions": [], "short_answer_questions": []}
    try:
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())
    except Exception:
        return {"error": "parse error", "multiple_choice_questions": [], "short_answer_questions": []}


def chatbot_response(question: str, transcript: str = "") -> str:
    return _call(
        "You are a classroom assistant. Answer ONLY from this transcript. "
        "If the answer is not in the transcript say: This was not covered in the lecture.\n\n"
        f"Transcript: {transcript}\n\nQuestion: {question}"
    )
