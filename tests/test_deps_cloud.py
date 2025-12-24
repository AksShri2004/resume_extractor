import pytest

def test_google_genai_installed():
    """Test that langchain-google-genai is installed and importable."""
    try:
        import langchain_google_genai
    except ImportError:
        pytest.fail("langchain-google-genai is not installed")
