from pydantic import BaseModel
from typing import List, Optional

class WorkExperience(BaseModel):
    company: str
    role: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None

class Education(BaseModel):
    degree: str
    institution: str
    years: Optional[str] = None

class Project(BaseModel):
    name: str
    description: Optional[str] = None
    technology_stack: List[str] = []

class ResumeSchema(BaseModel):
    skills: List[str] = []
    experience: List[WorkExperience] = []
    education: List[Education] = []
    projects: List[Project] = []
    summary: str
