from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    API_KEY: str = "test-secret-key"
    GUEST_KEY: Optional[str] = "GUEST123"
    GUEST_USAGE_LIMIT: int = 3
    API_V1_STR: str = "/v1"
    PROJECT_NAME: str = "Resume Extractor"
    
    # LLM Configuration
    LLM_PROVIDER: str = "ollama"  # 'ollama' or 'google'
    
    # Ollama Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma3"
    
    # Google AI Studio Settings
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_MODEL: str = "gemma-3-27b-it"

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
