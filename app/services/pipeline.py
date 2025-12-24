from app.services.pdf_extractor import PDFExtractor
from app.services.llm_parser import LLMParser
import logging

# In-memory DB for MVP
jobs_db = {}

def process_resume(job_id: str, file_content: bytes):
    """
    Background task to process resume: Extract text -> LLM Parse -> Save Result.
    """
    try:
        # Extract text
        extractor = PDFExtractor()
        text = extractor.extract_text(file_content)
        
        if not text:
            raise ValueError("No text could be extracted from the PDF")

        # Parse with LLM
        parser = LLMParser()
        result = parser.parse(text)
        
        # Save result
        jobs_db[job_id] = {
            "status": "completed",
            "result": result
        }
        
    except Exception as e:
        logging.error(f"Error processing job {job_id}: {e}")
        jobs_db[job_id] = {
            "status": "failed",
            "error": str(e)
        }
