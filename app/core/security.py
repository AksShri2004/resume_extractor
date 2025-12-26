import time
from typing import Optional
from fastapi import Security, HTTPException, status, Request
from fastapi.security.api_key import APIKeyHeader
from app.core.config import settings
from datetime import date
from collections import defaultdict

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# In-memory usage tracker: (ip, date) -> count
usage_tracker = defaultdict(int)
# Global cooldown tracker
last_request_time = 0

async def get_api_key(
    request: Request,
    api_key_header: Optional[str] = Security(api_key_header)
):
    global last_request_time
    
    # 1. Check Master API Key (Unlimited & Bypasses Cooldown)
    if api_key_header == settings.API_KEY:
        return api_key_header
    
    # 2. Keyless Access or Guest Key (Rate Limited & Cooldown Applied)
    # A. Global Cooldown (10 seconds)
    current_time = time.time()
    if current_time - last_request_time < 10:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Server is busy. Please try again in a few seconds."
        )
    
    # B. IP-based Daily Limit
    forwarded = request.headers.get("X-Forwarded-For")
    client_ip = forwarded.split(",")[0] if forwarded else request.client.host
    
    today = date.today().isoformat()
    usage_id = f"{client_ip}-{today}"
    
    if usage_tracker[usage_id] >= settings.GUEST_USAGE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily limit of {settings.GUEST_USAGE_LIMIT} resumes reached. Please try again tomorrow."
        )
    
    # Update trackers
    usage_tracker[usage_id] += 1
    last_request_time = current_time
    return api_key_header or "guest"
