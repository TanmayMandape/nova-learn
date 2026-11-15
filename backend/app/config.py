import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
ENV_PATH = os.path.join(BACKEND_DIR, ".env")


class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    ALLOWED_ORIGINS: List[str] = ["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"]
    DEBUG: bool = False

    model_config = SettingsConfigDict(
        env_file=(ENV_PATH, ".env"),
        extra="ignore"
    )

    def __init__(self, **values):
        super().__init__(**values)
        # Fallback to VITE_ aliases if SUPABASE keys not provided bare
        if not self.SUPABASE_URL and os.getenv("VITE_SUPABASE_URL"):
            self.SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "")
        if not self.SUPABASE_ANON_KEY and os.getenv("VITE_SUPABASE_ANON_KEY"):
            self.SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "")


settings = Settings()
