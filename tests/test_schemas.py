from app.schemas.resume import ResumeSchema, WorkExperience, Education, Project
import pytest
from pydantic import ValidationError

def test_resume_schema_success():
    """Test successful validation of a complete resume JSON."""
    data = {
        "skills": ["Python", "Docker"],
        "experience": [
            {
                "company": "Tech Corp",
                "role": "Software Engineer",
                "start_date": "2020-01",
                "end_date": "2022-12",
                "description": "Building microservices."
            }
        ],
        "education": [
            {
                "degree": "B.S. Computer Science",
                "institution": "State University",
                "years": "2016-2020"
            }
        ],
        "projects": [
            {
                "name": "Resume Extractor",
                "description": "AI parser",
                "technology_stack": ["Python", "FastAPI"]
            }
        ],
        "summary": "Experienced developer."
    }
    resume = ResumeSchema(**data)
    assert len(resume.skills) == 2
    assert resume.experience[0].company == "Tech Corp"
    assert resume.projects[0].technology_stack == ["Python", "FastAPI"]

def test_resume_schema_partial_data():
    """Test validation with missing optional fields or empty lists."""
    data = {
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "summary": "Minimalist"
    }
    resume = ResumeSchema(**data)
    assert resume.summary == "Minimalist"

def test_resume_schema_validation_error():
    """Test that invalid data raises ValidationError."""
    data = {
        "skills": "Not a list",
        "summary": 123
    }
    with pytest.raises(ValidationError):
        ResumeSchema(**data)
