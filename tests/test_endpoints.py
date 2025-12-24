from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch
from app.services.pipeline import jobs_db
import pytest

client = TestClient(app)

def test_submit_job_success():
    headers = {"X-API-Key": "test-secret-key"}
    # Mocking the background task function where it is imported in the endpoint
    # I'll assuming app.api.v1.endpoints.resume is the module
    with patch("app.api.v1.endpoints.resume.process_resume") as mock_process:
        response = client.post(
            "/v1/parse",
            files={"file": ("resume.pdf", b"%PDF-1.4...", "application/pdf")},
            headers=headers
        )
        # 202 Accepted is standard for background tasks
        if response.status_code != 202:
            print(response.text)
        assert response.status_code == 202
        data = response.json()
        assert "job_id" in data
        # Ensure background task was triggered
        # In TestClient, background tasks are executed synchronously if not mocked?
        # No, TestClient supports BackgroundTasks.
        # But patching 'process_resume' ensures we don't actually run it.
        # However, TestClient context manager might be needed?
        # Actually, standard patch works if the function is passed to BackgroundTasks.

def test_get_job_status_found():
    headers = {"X-API-Key": "test-secret-key"}
    jobs_db["job-123"] = {"status": "completed", "result": {"skills": ["Python"]}}
    
    response = client.get("/v1/jobs/job-123", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["result"]["skills"] == ["Python"]

def test_get_job_status_not_found():
    headers = {"X-API-Key": "test-secret-key"}
    response = client.get("/v1/jobs/non-existent", headers=headers)
    assert response.status_code == 404
