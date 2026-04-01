import time

def generate_notes(lecture_transcript: str) -> str:
    """Mock service to generate notes from a transcript."""
    return f"Summary for the lecture:\n\n{lecture_transcript[:200]}...\n\n- Key Point 1\n- Key Point 2\n- Key Takeaway"

def generate_assignment(lecture_transcript: str) -> str:
    """Mock service to generate an assignment from a transcript."""
    return f"Assignment based on lecture:\n\n1. Explain the main concept of {lecture_transcript[:50]}...\n2. How does this compare to related topics?\n3. Practical exercise."

def chatbot_response(user_query: str) -> str:
    """Mock service for chatbot interactions."""
    return f"Mock Response to: '{user_query}'\n\nThis is a simulated AI response. In a real application, this would connect to an LLM like GPT or Claude."
