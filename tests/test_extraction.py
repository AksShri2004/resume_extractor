from unittest.mock import MagicMock, patch
from app.services.pdf_extractor import PDFExtractor
import pytest

def test_extract_text_pdfplumber_success():
    """Test successful extraction using pdfplumber."""
    mock_pdf = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Extracted Text"
    mock_pdf.pages = [mock_page]
    
    with patch("app.services.pdf_extractor.pdfplumber.open") as mock_open:
        mock_open.return_value.__enter__.return_value = mock_pdf
        
        extractor = PDFExtractor()
        # Mocking bytes input
        text = extractor.extract_text(b"%PDF-1.4 mock content")
        
        assert text == "Extracted Text"

def test_extract_text_fallback_pypdf():
    """Test fallback to pypdf if pdfplumber fails or returns empty."""
    # This implies I should implement fallback logic.
    # The task says "using pdfplumber and pypdf".
    # I'll implement logic: try pdfplumber, if error/empty -> try pypdf.
    
    with patch("app.services.pdf_extractor.pdfplumber.open") as mock_plumber:
        # Simulate pdfplumber error
        mock_plumber.side_effect = Exception("Corrupt PDF")
        
        with patch("app.services.pdf_extractor.pypdf.PdfReader") as mock_pypdf:
            mock_reader = MagicMock()
            mock_page = MagicMock()
            mock_page.extract_text.return_value = "Fallback Text"
            mock_reader.pages = [mock_page]
            mock_pypdf.return_value = mock_reader
            
            extractor = PDFExtractor()
            text = extractor.extract_text(b"%PDF-1.4 mock content")
            
            assert text == "Fallback Text"
