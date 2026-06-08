from pydantic import BaseModel
from typing import Optional

class AnalysisRequest(BaseModel):
    platform: str
    keywords: list[str]  # for trend alignment
    target_country: str  # for posting timing
    intended_posting_time: str  # HH:MM format
    follower_count: int
    avg_views_last_5: float
    days_since_last_post: int