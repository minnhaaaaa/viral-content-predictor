from typing import List

from pydantic import BaseModel


class DriftTimestamp(BaseModel):
    time: float
    severity: str  # "hard" or "soft"
    cause: str
    recommendation: str


class AttentionPoint(BaseModel):
    second: int
    score: float


class EmotionalPoint(BaseModel):
    second: int
    valence: float


class LayerScores(BaseModel):
    neural_visual: float
    neural_audio: float
    emotional_arc: float
    platform_compliance: float


class PlatformScores(BaseModel):
    tiktok: float
    reels: float
    shorts: float


class HookScore(BaseModel):
    tiktok: float
    reels: float
    shorts: float


class DistributionBreakdown(BaseModel):
    trend_alignment: float
    account_health: float
    posting_timing: float
    multiplier: float
    posting_time_recommendation: str

class HookIteration(BaseModel):
    strategy: str
    suggestion: str

class AnalysisResponse(BaseModel):
    composite_score: float
    platform_scores: PlatformScores
    layer_scores: LayerScores
    attention_curve: List[AttentionPoint]
    drift_timestamps: List[DriftTimestamp]
    emotional_arc: List[EmotionalPoint]
    hook_score: HookScore
    distribution: DistributionBreakdown
    ai_summary: str = ""
    hook_iterations: List[HookIteration] = []
