import os
from app.core.config import Settings

def test_config_override():
    """Test that configuration can be overridden by environment variables (critical for Docker)."""
    os.environ["OLLAMA_BASE_URL"] = "http://ollama:11434"
    settings = Settings()
    assert settings.OLLAMA_BASE_URL == "http://ollama:11434"
    del os.environ["OLLAMA_BASE_URL"]
