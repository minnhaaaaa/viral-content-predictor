from typing import List

from pipeline.layer1_visual import analyse_visual
from schemas.response import (
    AnalysisResponse,
    AttentionPoint,
    DistributionBreakdown,
    EmotionalPoint,
    HookScore,
    LayerScores,
    PlatformScores,
)


def run_analysis(
    video_path: str,
    platform: str,
    keywords: List[str],
    target_country: str,
    intended_posting_time: str,
    follower_count: int,
    avg_views_last_10: float,
    days_since_last_post: int,
) -> AnalysisResponse:

    # Layer 1 — Visual
    visual_output = analyse_visual(video_path)
    duration = len(visual_output["frame_saliency"])

    # Compute mean visual score from Layer 1 outputs
    def mean(lst):
        return round(sum(lst) / len(lst), 2) if lst else 0.0

    neural_visual_score = mean(
        [
            mean(visual_output["frame_saliency"]),
            mean(visual_output["motion_energy"]),
            mean(visual_output["luminance_shock"]),
            mean(visual_output["colour_valence"]),
            mean(visual_output["face_gaze_pull"]),
        ]
    )

    # Attention curve from Layer 1 (will be enriched by other layers later)
    attention_curve = [
        AttentionPoint(second=i, score=round(visual_output["frame_saliency"][i], 2))
        for i in range(duration)
    ]

    # MOCK DATA

    neural_audio_score = 70.0  # replace with Layer 2 output
    emotional_arc_score = 75.0  # replace with Layer 3 output
    platform_compliance_score = 60.0  # replace with Layer 4 output

    emotional_arc = [
        EmotionalPoint(second=i, valence=0.0) for i in range(duration)
    ]  # replace with Layer 3 output

    drift_timestamps = []  # replace with computed drift detection
    trend_alignment = 5.0  # replace with distribution/trend_alignment.py
    account_health = 5.0  # replace with distribution/account_health.py
    posting_timing = 5.0  # replace with distribution/posting_timing.py
    posting_recommendation = "Pending"  # replace with posting_timing output

    # SCORING

    # Platform weights
    weights = {
        "tiktok": {"visual": 0.22, "audio": 0.28, "emotion": 0.20, "platform": 0.30},
        "reels": {"visual": 0.26, "audio": 0.12, "emotion": 0.24, "platform": 0.38},
        "shorts": {"visual": 0.18, "audio": 0.11, "emotion": 0.22, "platform": 0.49},
    }

    def content_score(w):
        return round(
            neural_visual_score * w["visual"]
            + neural_audio_score * w["audio"]
            + emotional_arc_score * w["emotion"]
            + platform_compliance_score * w["platform"],
            2,
        )

    tiktok_score = content_score(weights["tiktok"])
    reels_score = content_score(weights["reels"])
    shorts_score = content_score(weights["shorts"])
    target_platform = platform.lower() if platform else "all"
    platform_map = {
        "tiktok": tiktok_score,
        "reels": reels_score,
        "shorts": shorts_score,
    }
    base_score = platform_map.get(target_platform)
    if base_score is None:
        base_score = round((tiktok_score + reels_score + shorts_score) / 3, 2)

    # Distribution multiplier
    D = round((trend_alignment + account_health + posting_timing) / 3, 2)
    multiplier = round(0.5 + (D / 10), 2)
    composite = round(min(base_score * multiplier, 100), 2)

    # Hook scores — mean of visual signals in hook window only
    hook_windows = {"tiktok": 1, "reels": 2, "shorts": 3}

    def hook_score_for(seconds):
        window = visual_output["frame_saliency"][:seconds]
        return round(mean(window), 2) if window else 0.0

    return AnalysisResponse(
        composite_score=composite,
        platform_scores=PlatformScores(
            tiktok=tiktok_score, reels=reels_score, shorts=shorts_score
        ),
        layer_scores=LayerScores(
            neural_visual=neural_visual_score,
            neural_audio=neural_audio_score,
            emotional_arc=emotional_arc_score,
            platform_compliance=platform_compliance_score,
        ),
        attention_curve=attention_curve,
        drift_timestamps=drift_timestamps,
        emotional_arc=emotional_arc,
        hook_score=HookScore(
            tiktok=hook_score_for(hook_windows["tiktok"]),
            reels=hook_score_for(hook_windows["reels"]),
            shorts=hook_score_for(hook_windows["shorts"]),
        ),
        distribution=DistributionBreakdown(
            trend_alignment=trend_alignment,
            account_health=account_health,
            posting_timing=posting_timing,
            multiplier=multiplier,
            posting_time_recommendation=posting_recommendation,
        ),
    )
