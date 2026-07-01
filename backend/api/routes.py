import os
import shutil
import uuid
from typing import List

from fastapi import APIRouter, File, Form, UploadFile

from schemas.response import AnalysisResponse
from services.analysis_service import run_analysis

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/analyse", response_model=AnalysisResponse)
async def analyse_video(
    video: UploadFile = File(...),
    platform: str = Form(...),
    keywords: str = Form(...),  # comma separated, e.g. "fitness,workout,gym"
    target_country: str = Form(...),
    intended_posting_time: str = Form(...),
    follower_count: int = Form(...),
    avg_views_last_10: float = Form(...),
    days_since_last_post: int = Form(...),
):
    # Save uploaded video to temp folder
    temp_filename = f"{uuid.uuid4()}.mp4"
    temp_path = os.path.join("temp_uploads", temp_filename)
    os.makedirs("temp_uploads", exist_ok=True)

    with open(temp_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    try:
        keyword_list = [k.strip() for k in keywords.split(",")]

        result = run_analysis(
            video_path=temp_path,
            platform=platform,
            keywords=keyword_list,
            target_country=target_country,
            intended_posting_time=intended_posting_time,
            follower_count=follower_count,
            avg_views_last_10=avg_views_last_10,
            days_since_last_post=days_since_last_post,
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return result
