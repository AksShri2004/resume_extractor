import pdfplumber
import pypdf
import io
import pytesseract
from pdf2image import convert_from_bytes

class PDFExtractor:
    def extract_text(self, file_content: bytes) -> str:
        text = ""
        
        # Try pdfplumber first
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception:
            pass
            
        if text.strip():
            return text.strip()
            
        # Fallback to pypdf
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_content))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception:
            pass
            
        if text.strip():
            return text.strip()

        # Fallback to OCR (Tesseract)
        try:
            images = convert_from_bytes(file_content)
            for image in images:
                text += pytesseract.image_to_string(image) + "\n"
        except Exception:
            pass
            
        return text.strip()