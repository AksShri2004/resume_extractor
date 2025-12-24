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
        text = extractor.extract_text(b"%PDF-1.4 mock content")
        
        assert text == "Extracted Text"

def test_extract_text_fallback_pypdf():
    """Test fallback to pypdf if pdfplumber fails."""
    with patch("app.services.pdf_extractor.pdfplumber.open") as mock_plumber:
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

def test_extract_text_fallback_ocr():
    """Test fallback to OCR if standard text extraction returns empty."""
    with patch("app.services.pdf_extractor.pdfplumber.open") as mock_plumber, \
         patch("app.services.pdf_extractor.pypdf.PdfReader") as mock_pypdf, \
         patch("app.services.pdf_extractor.convert_from_bytes") as mock_convert, \
         patch("app.services.pdf_extractor.pytesseract.image_to_string") as mock_tesseract:
         
        # pdfplumber returns empty text
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.extract_text.return_value = ""
        mock_pdf.pages = [mock_page]
        mock_plumber.return_value.__enter__.return_value = mock_pdf
        
        # pypdf returns empty text
        mock_reader = MagicMock()
        mock_page_pypdf = MagicMock()
        mock_page_pypdf.extract_text.return_value = ""
        mock_reader.pages = [mock_page_pypdf]
        mock_pypdf.return_value = mock_reader
        
        # pdf2image returns one image
        mock_convert.return_value = ["image1"]
        
        # pytesseract returns text
        mock_tesseract.return_value = "OCR Text"
        
        extractor = PDFExtractor()
        text = extractor.extract_text(b"%PDF-1.4...")
        
        assert "OCR Text" in text