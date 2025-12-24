from unittest.mock import MagicMock, patch
from app.services.pipeline import process_resume, jobs_db
import pytest

def test_process_resume_success():
    job_id = "test-job-1"
    # Setup initial state
    jobs_db[job_id] = {"status": "pending"}
    
    with patch("app.services.pipeline.PDFExtractor") as mock_extractor_cls, \
         patch("app.services.pipeline.LLMParser") as mock_parser_cls:
         
         mock_extractor = mock_extractor_cls.return_value
         mock_extractor.extract_text.return_value = "Resume Text"
         
         mock_parser = mock_parser_cls.return_value
         mock_parser.parse.return_value = {"skills": ["Python"]}
         
         # Execute
         process_resume(job_id, b"content")
         
         # Assert
         assert jobs_db[job_id]["status"] == "completed"
         assert jobs_db[job_id]["result"] == {"skills": ["Python"]}

def test_process_resume_failure():
    job_id = "test-job-2"
    jobs_db[job_id] = {"status": "pending"}
    
    with patch("app.services.pipeline.PDFExtractor") as mock_extractor_cls:
         mock_extractor = mock_extractor_cls.return_value
         mock_extractor.extract_text.side_effect = Exception("Extraction failed")
         
         process_resume(job_id, b"content")
         
         assert jobs_db[job_id]["status"] == "failed"
         assert "Extraction failed" in jobs_db[job_id]["error"]