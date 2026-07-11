import os
import shutil
import uuid

from backend.schemas.response import AnalysisResponse
from backend.services.analysis_service import run_analysis
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from backend.utils.location_search import search_locations
router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.get("/locations/search")
def search_locations_endpoint(q: str):
    """
    Autocomplete endpoint for the frontend location dropwdown
    Example: GET /locations/search?q=mumbai
    """
    results = search_locations(q)
    return {"results": results}

@router.post("/analyse", response_model=AnalysisResponse)
async def analyse_video(
    video: UploadFile = File(...),
    platform: str = Form(...),
    keywords: str = Form(...),
    target_location_lat: float = Form(...),
    target_location_lon: float = Form(...),
    target_location_label: str = Form(...),
    intended_posting_time: str = Form(...),
    follower_count: int = Form(...),
    avg_views_last_10: float = Form(...),
    days_since_last_post: int = Form(...),
    content_category: str = Form(default=""),
    audio_track: str = Form(default=""),
):
    # Validate file type
    if not video.filename.endswith((".mp4", ".mov")):
        raise HTTPException(
            status_code=400, detail="Only .mp4 and .mov files are supported"
        )

    # Validate file size — reject anything over 200MB
    contents = await video.read()
    if len(contents) > 200 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 200MB limit")

    # Normalise platform name from frontend values to internal values
    platform_map = {"instagram": "reels", "youtube": "shorts", "tiktok": "tiktok"}
    platform = platform_map.get(platform, platform)

    # Save to temp
    temp_filename = f"{uuid.uuid4()}.mp4"
    temp_path = os.path.join("temp_uploads", temp_filename)
    os.makedirs("temp_uploads", exist_ok=True)

    with open(temp_path, "wb") as f:
        f.write(contents)

    try:
        keyword_list = [k.strip() for k in keywords.split(",")]

        result = run_analysis(
            video_path=temp_path,
            platform=platform,
            keywords=keyword_list,
            target_location_lat=target_location_lat,
            target_location_lon=target_location_lon,
            target_location_label=target_location_label,
            intended_posting_time=intended_posting_time,
            follower_count=follower_count,
            avg_views_last_10=avg_views_last_10,
            days_since_last_post=days_since_last_post,
            content_category=content_category,
            audio_track=audio_track,
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return result
