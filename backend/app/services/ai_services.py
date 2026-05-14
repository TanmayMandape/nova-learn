import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def safe_groq_call(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"ERROR: {str(e)}"


def generate_notes(transcript: str) -> str:
    prompt = f"""Generate clear structured lecture notes from this transcript.
Use numbered points. Keep it concise and educational.
Transcript: {transcript}
Return only the notes, no extra text."""
    result = safe_groq_call(prompt)
    if "ERROR" in result:
        return "Could not generate notes. Please try again."
    return result


def extract_keywords(transcript: str) -> list:
    prompt = f"""Extract exactly 10 most important keywords from this lecture transcript.
Return ONLY a valid JSON array like: ["keyword1", "keyword2"]
No explanation. No markdown. Just JSON array.
Transcript: {transcript}"""
    result = safe_groq_call(prompt)
    try:
        cleaned = result.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception:
        return [k.strip() for k in result.split(",")][:10]


def generate_assignment(keywords: list, transcript: str) -> dict:
    keywords_str = ", ".join(keywords)
    prompt = f"""Create exactly 10 assignment questions based on keywords: {keywords_str}
And transcript: {transcript}
Return ONLY valid JSON, no markdown:
{{"mcq": [{{"question": "question here","options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"],"answer": "A) opt1"}}],"short_answer": [{{"question": "question here"}}]}}
mcq must have exactly 5. short_answer must have exactly 5."""
    result = safe_groq_call(prompt)
    try:
        cleaned = result.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception:
        return {"mcq": [], "short_answer": [], "error": "Could not parse. Try again."}


def generate_assignment_from_transcript(transcript: str) -> dict:
    keywords = extract_keywords(transcript)
    return generate_assignment(keywords, transcript)


def chatbot_response(question: str, transcript: str = "") -> str:
    prompt = f"""You are a classroom assistant. Answer using ONLY this transcript.
If answer not in transcript say: "This topic was not covered in today's lecture. Please refer to your course materials or ask your teacher."
Keep answer under 100 words.
Transcript: {transcript}
Question: {question}"""
    result = safe_groq_call(prompt)
    if "ERROR" in result:
        return "Could not get answer. Please try again."
    return result
