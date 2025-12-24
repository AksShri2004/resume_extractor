from unittest.mock import MagicMock, patch
from app.services.llm_parser import LLMParser
import pytest

def test_llm_parser_init():
    """Test that the LLMParser initializes ChatOllama correctly."""
    with patch("app.services.llm_parser.ChatOllama") as mock_ollama:
        parser = LLMParser()
        mock_ollama.assert_called_once()
        # Check if called with correct model
        args, kwargs = mock_ollama.call_args
        assert kwargs.get("model") == "gemma3"
