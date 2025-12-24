import os
from app.core.config import Settings
import pytest

def test_cloud_config_defaults():
    """Test default settings (should default to Ollama for backward compatibility)."""
    # Clear env vars if any
    if "LLM_PROVIDER" in os.environ: del os.environ["LLM_PROVIDER"]
    settings = Settings()
    assert settings.LLM_PROVIDER == "ollama"

def test_cloud_config_google():
    """Test configuration for Google provider."""
    os.environ["LLM_PROVIDER"] = "google"
    os.environ["GOOGLE_API_KEY"] = "fake-key"
    settings = Settings()
    assert settings.LLM_PROVIDER == "google"
    assert settings.GOOGLE_API_KEY == "fake-key"
    del os.environ["LLM_PROVIDER"]
    del os.environ["GOOGLE_API_KEY"]
