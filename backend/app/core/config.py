import os
from pydantic import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "AI-Antivirus"
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./ai_antivirus.db"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Security settings
    SECRET_KEY: str = "supersecretkey"  # In production, use a proper secret key
    
    # File upload settings
    UPLOAD_DIR: str = "./uploads"
    
    # ML model settings
    MODEL_PATH: str = "./app/ml/ai_model.pkl"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
