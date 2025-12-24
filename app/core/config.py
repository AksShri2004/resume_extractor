from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    API_KEY: str = "test-secret-key"
    API_V1_STR: str = "/v1"
    PROJECT_NAME: str = "Resume Extractor"
    
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma3"

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()