from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, lectures, assignments, chatbot, transcription
from app.config import settings

app = FastAPI(
    title="AI-Powered Classroom Assistant API",
    description="Backend API for managing lectures, assignments, and AI chatbot interactions.",
    version="1.0.0",
    debug=settings.DEBUG,
)

# CORS — allow all origins (demo mode)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lectures.router)
app.include_router(assignments.router)
app.include_router(chatbot.router)
app.include_router(transcription.router)


@app.get("/")
async def root():
    return {"status": "running", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
