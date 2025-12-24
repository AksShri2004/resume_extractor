from unittest.mock import MagicMock, patch
from app.services.llm_parser import LLMParser
import pytest

def test_llm_parser_uses_ollama_by_default():
    """Test that LLMParser still defaults to Ollama if configured."""
    with patch("app.services.llm_parser.settings") as mock_settings, \
         patch("app.services.llm_parser.ChatOllama") as mock_ollama:
        
        mock_settings.LLM_PROVIDER = "ollama"
        mock_settings.OLLAMA_BASE_URL = "http://localhost:11434"
        mock_settings.OLLAMA_MODEL = "gemma3"
        
        parser = LLMParser()
        mock_ollama.assert_called_once()

def test_llm_parser_uses_google_when_selected():
    """Test that LLMParser uses Google backend when selected."""
    with patch("app.services.llm_parser.settings") as mock_settings, \
         patch("app.services.llm_parser.ChatGoogleGenerativeAI") as mock_google:
        
        mock_settings.LLM_PROVIDER = "google"
        mock_settings.GOOGLE_API_KEY = "fake-key"
        mock_settings.GOOGLE_MODEL = "gemini-1.5-flash"
        
        parser = LLMParser()
        mock_google.assert_called_once()

def test_llm_parser_parse_logic():
    """Test that parse method invokes the underlying chain."""
    with patch("app.services.llm_parser.settings") as mock_settings, \
         patch("app.services.llm_parser.ChatGoogleGenerativeAI"):
        
        mock_settings.LLM_PROVIDER = "google"
        mock_settings.GOOGLE_API_KEY = "fake-key"
        
        parser = LLMParser()
        # Replace the chain with a mock to verify invocation
        parser.chain = MagicMock()
        parser.chain.invoke.return_value = {"summary": "Parsed"}
        
        result = parser.parse("resume text")
        assert result == {"summary": "Parsed"}
        parser.chain.invoke.assert_called_once_with({"text": "resume text"})
