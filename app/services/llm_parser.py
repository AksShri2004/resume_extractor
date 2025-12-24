from langchain_community.chat_models import ChatOllama
from app.core.config import settings

class LLMParser:
    def __init__(self):
        self.llm = ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL
        )
