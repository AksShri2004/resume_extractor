from fastapi import FastAPI, Depends, APIRouter
from app.core.config import settings
from app.core.security import get_api_key

app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/health")
def health_check():
    return {"status": "ok"}

api_router = APIRouter()

@api_router.get("/dummy")
def dummy_endpoint():
    return {"message": "authenticated"}

app.include_router(api_router, prefix="/v1", dependencies=[Depends(get_api_key)])
