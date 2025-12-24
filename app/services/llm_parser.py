from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.core.config import settings
from app.schemas.resume import ResumeSchema

class LLMParser:
    def __init__(self):
        self.llm = ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL,
            format="json"
        )
        
        self.prompt_template = ChatPromptTemplate.from_template("""
        You are an expert resume parser. Extract the following information from the provided resume text into a valid JSON representation.
        
        Fields to extract:
        - Skills: A normalized list of skill strings.
        - Work experience: List of objects with (company, role, start_date, end_date, description).
        - Education: List of objects with (degree, institution, years).
        - Projects: List of objects with (name, description, technology_stack).
        - Summary: A concise professional summary.
        
        Resume Text:
        {text}
        
        Response must be strictly valid JSON according to the following schema:
        {{
            "skills": ["string"],
            "experience": [{{ "company": "string", "role": "string", "start_date": "string", "end_date": "string", "description": "string" }}],
            "education": [{{ "degree": "string", "institution": "string", "years": "string" }}],
            "projects": [{{ "name": "string", "description": "string", "technology_stack": ["string"] }}],
            "summary": "string"
        }}
        """)
        
        self.output_parser = JsonOutputParser(pydantic_object=ResumeSchema)
        self.chain = self.prompt_template | self.llm | self.output_parser
        
    def parse(self, text: str) -> dict:
        return self.chain.invoke({"text": text})