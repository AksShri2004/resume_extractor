from fastapi import FastAPI, Depends, APIRouter
from app.core.config import settings
from app.core.security import get_api_key
from app.api.v1.endpoints import resume
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/health")
def health_check():
    return {"status": "ok"}

api_router = APIRouter()
api_router.include_router(resume.router, tags=["resume"])

app.include_router(api_router, prefix=settings.API_V1_STR, dependencies=[Depends(get_api_key)])
