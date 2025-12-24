from unittest.mock import patch
from app.services.pipeline import process_resume, jobs_db
import pytest
import logging

def test_pipeline_failure_logs_error():
    job_id = "test-log-1"
    jobs_db[job_id] = {"status": "pending"}
    
    with patch("app.services.pipeline.PDFExtractor") as mock_extractor_cls:
         mock_extractor = mock_extractor_cls.return_value
         mock_extractor.extract_text.side_effect = Exception("Critical Error")
         
         with patch("app.services.pipeline.logging") as mock_logger:
             process_resume(job_id, b"content")
             
             mock_logger.error.assert_called_once()
             args, _ = mock_logger.error.call_args
             assert "Critical Error" in args[0]

def test_structured_logging_config():
    # Verify we have a logging config module
    from app.core.logging import setup_logging
    assert callable(setup_logging)
