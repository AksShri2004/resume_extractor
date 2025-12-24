from unittest.mock import MagicMock, patch
from app.services.llm_parser import LLMParser
import pytest

def test_llm_parser_init():
    """Test that the LLMParser initializes ChatOllama correctly."""
    with patch("app.services.llm_parser.ChatOllama") as mock_ollama:
        parser = LLMParser()
        mock_ollama.assert_called_once()
        args, kwargs = mock_ollama.call_args
        assert kwargs.get("model") == "gemma3"

def test_prompt_template_exists():
    """Test that the prompt template is initialized and contains required fields."""
    with patch("app.services.llm_parser.ChatOllama"):
        parser = LLMParser()
        assert hasattr(parser, "prompt_template")
        # Format with dummy text
        prompt_content = parser.prompt_template.format(text="Sample Resume")
        assert "Skills" in prompt_content
        assert "Work experience" in prompt_content
        assert "Education" in prompt_content
        assert "Projects" in prompt_content
        assert "summary" in prompt_content
        assert "JSON" in prompt_content # Instruction to output JSON