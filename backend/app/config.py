import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    ALLOWED_ORIGINS: List[str] = ["http://localhost:8080"]
    DEBUG: bool = False

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
