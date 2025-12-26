from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, status, Depends
from app.services.pipeline import process_resume, jobs_db
from app.core.security import get_api_key
import uuid

router = APIRouter()

@router.post("/parse", status_code=status.HTTP_202_ACCEPTED)
async def submit_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    token: str = Depends(get_api_key)
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
        
    file_content = await file.read()
    job_id = str(uuid.uuid4())
    
    # Initialize job status
    jobs_db[job_id] = {"status": "pending"}
    
    background_tasks.add_task(process_resume, job_id, file_content)
    
    return {"job_id": job_id, "status": "pending"}

@router.get("/jobs/{job_id}")
def get_job_status(job_id: str):
    job = jobs_db.get(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job
