from pydantic import BaseModel
from typing import Optional

class DriftTimestamp(BaseModel):
    time: float
    severity: str  # hard or soft
    cause: str
    recommendation: str

class LayerScores(BaseModel):
    neural_visual: float
    neural_audio: float
    emotional_arc: float
    platform_compliance: float

class DistributionBreakdown(BaseModel):
    trend_alignment: float
    account_health: float
    posting_timing: float
    multiplier: float

class PlatformScores(BaseModel):
    tiktok: float
    reels: float
    shorts: float

class AnalysisResponse(BaseModel):
    composite_score: float
    platform_scores: PlatformScores
    layer_scores: LayerScores
    attention_curve: list[dict]
    drift_timestamps: list[DriftTimestamp]
    emotional_arc: list[dict]
    hook_score: dict
    distribution: DistributionBreakdown