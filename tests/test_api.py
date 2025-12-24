from fastapi.testclient import TestClient
from app.main import app
import os

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_api_key_missing():
    # Hit an endpoint that requires auth
    response = client.get("/v1/jobs/123")
    assert response.status_code == 403

def test_api_key_valid():
    headers = {"X-API-Key": "test-secret-key"}
    response = client.get("/v1/jobs/123", headers=headers)
    # Auth passed, but job not found -> 404
    assert response.status_code == 404
    assert response.json()["detail"] == "Job not found"
