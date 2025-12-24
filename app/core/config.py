from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    API_KEY: str = "test-secret-key"
    API_V1_STR: str = "/v1"
    PROJECT_NAME: str = "Resume Extractor"

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()