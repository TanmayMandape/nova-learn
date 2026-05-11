import google.generativeai as genai
import os
import json
import time

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)


def get_model():
    return genai.GenerativeModel("gemini-1.5-flash")


def safe_gemini_call(prompt: str) -> str:
    for attempt in range(3):
        try:
            model = get_model()
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "EXHAUSTED" in error_str:
                if attempt < 2:
                    time.sleep(15)
                    continue
                return "QUOTA_ERROR"
            return f"ERROR: {error_str}"
    return "QUOTA_ERROR"


def generate_notes(transcript: str) -> str:
    prompt = f"""Generate clear structured lecture notes from this transcript.
Use numbered points. Keep it concise and educational.
Transcript: {transcript}
Return only the notes, no extra text."""
    result = safe_gemini_call(prompt)
    if result == "QUOTA_ERROR":
        return "AI is busy. Please try again in 1 minute."
    return result


def extract_keywords(transcript: str) -> list:
    prompt = f"""Extract exactly 10 most important keywords or topics from this lecture transcript.
Return ONLY a valid JSON array like this: ["keyword1", "keyword2", "keyword3"]
No explanation. No markdown. Just the JSON array.
Transcript: {transcript}"""
    result = safe_gemini_call(prompt)
    if result == "QUOTA_ERROR":
        return ["AI busy", "try again", "in 1 minute"]
    try:
        cleaned = result.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception:
        return [k.strip() for k in result.split(",")][:10]


def generate_assignment(keywords: list, transcript: str) -> dict:
    keywords_str = ", ".join(keywords)
    prompt = f"""Create exactly 10 assignment questions based on these keywords: {keywords_str}
And this transcript: {transcript}
Return ONLY valid JSON in this exact format, no markdown, no extra text:
{{"mcq": [{{"question": "question text here","options": ["A) option1", "B) option2", "C) option3", "D) option4"],"answer": "A) option1"}}],"short_answer": [{{"question": "question text here"}}]}}
mcq must have exactly 5 questions.
short_answer must have exactly 5 questions."""
    result = safe_gemini_call(prompt)
    if result == "QUOTA_ERROR":
        return {"mcq": [], "short_answer": [], "error": "AI busy. Try again in 1 minute."}
    try:
        cleaned = result.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception:
        return {"mcq": [], "short_answer": [], "error": "Could not parse questions. Try again."}


def generate_assignment_from_transcript(transcript: str) -> dict:
    """Single-call version used by the generate endpoint."""
    prompt = f"""Given this lecture transcript: {transcript}
Generate exactly 10 questions: 5 MCQs and 5 short answer questions.
Return ONLY valid JSON, no markdown:
{{"multiple_choice_questions": [{{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A) ..."}}], "short_answer_questions": [{{"question": "..."}}]}}"""
    result = safe_gemini_call(prompt)
    if result == "QUOTA_ERROR":
        return {"multiple_choice_questions": [], "short_answer_questions": [], "error": "AI busy. Try again in 1 minute."}
    try:
        cleaned = result.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception:
        return {"multiple_choice_questions": [], "short_answer_questions": [], "error": "Parse error. Try again."}


def chatbot_response(question: str, transcript: str = "") -> str:
    prompt = f"""You are a classroom assistant. Answer the student's question using ONLY the lecture transcript below.
If the answer is not in the transcript, say exactly: "This topic was not covered in today's lecture."
Keep answer clear and under 100 words.
Lecture Transcript: {transcript}
Student Question: {question}"""
    result = safe_gemini_call(prompt)
    if result == "QUOTA_ERROR":
        return "AI is busy. Please try again in 1 minute."
    return result
