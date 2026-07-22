import numpy as np
from backend.utils.video import extract_frames, extract_audio, get_video_metadata
from backend.pipeline.layer1_visual import analyse_visual
from backend.pipeline.layer2_audio import analyse_audio
from backend.pipeline.layer3_emotion import analyse_emotion
from backend.pipeline.layer4_platform import analyse_platform, PLATFORM_WEIGHTS
from backend.distribution.account_health import score_account_health
from backend.distribution.posting_timing import score_posting_timing
from backend.distribution.trend_alignment import score_trend_alignment
from backend.services.llm_service import generate_summary, generate_hook_iterations
from backend.schemas.response import (
    AnalysisResponse, PlatformScores, LayerScores,
    AttentionPoint, EmotionalPoint, DriftTimestamp,
    HookScore, DistributionBreakdown, HookIteration
)


# ────────────────────────────────────────────────
# Attention curve + drift detection
# ────────────────────────────────────────────────

def build_attention_curve(visual_output: dict, audio_output: dict, emotion_output: dict) -> list:
    """
    Combines visual, audio, and emotional signals into a single per-second
    attention score. This is what drives the attention curve chart and
    drift detection downstream.
    """
    duration = len(visual_output["frame_saliency"])
    surprise = audio_output["spectral_surprise"]
    arousal = emotion_output["arousal_trajectory"]

    curve = []
    for i in range(duration):
        visual_component = np.mean([
            visual_output["frame_saliency"][i],
            visual_output["motion_energy"][i],
            visual_output["luminance_shock"][i],
            visual_output["face_gaze_pull"][i],
            visual_output["colour_valence"][i]
        ])
        audio_component = surprise[i] if i < len(surprise) else 0.0
        emotion_component = arousal[i] if i < len(arousal) else 0.0

        # Weighted blend: visual carries the most weight, then audio, then emotion
        score = (visual_component * 0.5) + (audio_component * 0.3) + (emotion_component * 0.2)
        curve.append(round(float(score), 2))

    return curve


def detect_drift_points(attention_curve: list, window: int = 3) -> list:
    """
    Flags seconds where attention drops sharply relative to the recent
    local average. Hard drift = severe drop, soft drift = moderate drop.
    """
    drifts = []

    for i in range(1, len(attention_curve)):
        start = max(0, i - window)
        local_avg = np.mean(attention_curve[start:i]) if i > start else attention_curve[i]

        if local_avg <= 0:
            continue

        drop_ratio = (local_avg - attention_curve[i]) / local_avg

        if drop_ratio > 0.5:
            drifts.append(DriftTimestamp(
                time=float(i),
                severity="hard",
                cause="Sharp drop in combined visual, audio, and emotional signal.",
                recommendation="Insert a cut, sound effect, or new visual element around this timestamp."
            ))
        elif drop_ratio > 0.3:
            drifts.append(DriftTimestamp(
                time=float(i),
                severity="soft",
                cause="Moderate dip in engagement signal.",
                recommendation="Consider tightening pacing or adding a small visual/audio beat here."
            ))

    return drifts


# ────────────────────────────────────────────────
# Layer score summarisation
# ────────────────────────────────────────────────

def safe_mean(lst):
    return round(float(np.mean(lst)), 2) if lst else 0.0


def summarise_visual_layer(visual_output: dict) -> float:
    return safe_mean([
        safe_mean(visual_output["frame_saliency"]),
        safe_mean(visual_output["motion_energy"]),
        safe_mean(visual_output["luminance_shock"]),
        safe_mean(visual_output["face_gaze_pull"]),
        safe_mean(visual_output["colour_valence"])
    ])


def summarise_audio_layer(audio_output: dict) -> float:
    return safe_mean([
        audio_output["bpm_sync"],
        safe_mean(audio_output["spectral_surprise"]),
        audio_output["voice_prosody"],
        audio_output["loudness_variance"],
        max(0.0, 100.0 - audio_output["silence_ratio"])  # less silence = better
    ])


def summarise_emotion_layer(emotion_output: dict) -> float:
    valence = emotion_output["valence_trajectory"]
    arousal = emotion_output["arousal_trajectory"]

    if not valence or not arousal:
        return 0.0

    # Peak-end score: peak arousal + final valence, matching the earlier framework
    peak_arousal = max(arousal) if arousal else 0.0
    final_valence = valence[-1] if valence else 0.0

    # Scale final_valence (-1 to 1) up to a 0-100 contribution
    final_valence_scaled = (final_valence + 1) * 50

    peak_end_score = (peak_arousal * 0.6) + (final_valence_scaled * 0.4)
    return round(float(peak_end_score), 2)


# ────────────────────────────────────────────────
# Main orchestrator
# ────────────────────────────────────────────────

def run_analysis(
    video_path: str,
    platform: str,
    keywords: list,
    target_location_lat: float,
    target_location_lon: float,
    target_location_label: str,
    intended_posting_time: str,
    follower_count: int,
    avg_views_last_10: float,
    days_since_last_post: int,
    content_category: str = "",
    audio_track: str = ""
) -> AnalysisResponse:

    #  Extract audio
    audio_path = extract_audio(video_path, video_path.replace(".mp4", "_audio.wav"))

    #  Layer 1 — Visual
    visual_output = analyse_visual(video_path)
    duration = len(visual_output["frame_saliency"])

    #  Layer 3 — Emotion
    emotion_output = analyse_emotion(audio_path, duration)

    # Layer 2 — Audio
    audio_output = analyse_audio(
        audio_path,
        video_path,
        duration,
        has_speech=emotion_output["has_speech"]
    )

    # Layer 4 — Platform
    platform_output = analyse_platform(video_path, visual_output, audio_output)

    # Distribution factors
    account_health_result = score_account_health(
        follower_count=follower_count,
        avg_views_last_10=avg_views_last_10,
        days_since_last_post=days_since_last_post
    )

    posting_timing_result = score_posting_timing(
        lat=target_location_lat,
        lon=target_location_lon,
        intended_posting_time=intended_posting_time,
        location_label=target_location_label
    )

    trend_result = score_trend_alignment(
        keywords=keywords,
        transcript=emotion_output["transcript"],
        caption=content_category  # using content_category as a caption-adjacent signal
    )

    # Attention curve + drift detection
    attention_curve_values = build_attention_curve(visual_output, audio_output, emotion_output)
    attention_curve = [
        AttentionPoint(second=i, score=attention_curve_values[i])
        for i in range(duration)
    ]
    drift_timestamps = detect_drift_points(attention_curve_values)

    # Emotional arc for output
    emotional_arc = [
        EmotionalPoint(second=i, valence=emotion_output["valence_trajectory"][i] if i < len(emotion_output["valence_trajectory"]) else 0.0)
        for i in range(duration)
    ]

    # Layer score summaries
    neural_visual_score = summarise_visual_layer(visual_output)
    neural_audio_score = summarise_audio_layer(audio_output)
    emotional_arc_score = summarise_emotion_layer(emotion_output)
    platform_compliance_score = platform_output["compliance_score"]

    # Platform weighted content scores
    def content_score(weights):
        return round(
            neural_visual_score * weights["neural_visual"] +
            neural_audio_score * weights["neural_audio"] +
            emotional_arc_score * weights["emotional_arc"] +
            platform_compliance_score * weights["platform_compliance"],
            2
        )

    tiktok_score = content_score(PLATFORM_WEIGHTS["tiktok"])
    reels_score = content_score(PLATFORM_WEIGHTS["reels"])
    shorts_score = content_score(PLATFORM_WEIGHTS["shorts"])

    platform_map = {"tiktok": tiktok_score, "reels": reels_score, "shorts": shorts_score}
    base_score = platform_map.get(platform, round((tiktok_score + reels_score + shorts_score) / 3, 2))

    # Distribution multiplier
    D = round((
        trend_result["score"] +
        account_health_result["score"] +
        posting_timing_result["score"]
    ) / 3, 2)
    multiplier = round(0.5 + (D / 10), 2)
    composite = round(min(base_score * multiplier, 100), 2)
    response_data = {
            "composite_score": composite,
            "layer_scores": {
                "neural_visual": neural_visual_score,
                "neural_audio": neural_audio_score,
                "emotional_arc": emotional_arc_score,
                "platform_compliance": platform_compliance_score
            },
            "distribution": {
                "trend_alignment": trend_result["score"],
                "account_health": account_health_result["score"],
                "posting_timing": posting_timing_result["score"]
            },
            "drift_timestamps": drift_timestamps
        }

    ai_summary = generate_summary(response_data)
    hook_iterations_raw = generate_hook_iterations(
        transcript=emotion_output["transcript"],
        content_category=content_category,
        hook_scores=platform_output["hook_scores"]
    )
    hook_iterations = [HookIteration(**h) for h in hook_iterations_raw]

    return AnalysisResponse(
        composite_score=composite,
        platform_scores=PlatformScores(tiktok=tiktok_score, reels=reels_score, shorts=shorts_score),
        layer_scores=LayerScores(
            neural_visual=neural_visual_score,
            neural_audio=neural_audio_score,
            emotional_arc=emotional_arc_score,
            platform_compliance=platform_compliance_score
        ),
         attention_curve=attention_curve,
        drift_timestamps=drift_timestamps,
        emotional_arc=emotional_arc,
        hook_score=HookScore(**platform_output["hook_scores"]),
        distribution=DistributionBreakdown(
            trend_alignment=trend_result["score"],
            account_health=account_health_result["score"],
            posting_timing=posting_timing_result["score"],
            multiplier=multiplier,
            posting_time_recommendation=posting_timing_result["recommendation"]
        ),
        ai_summary=ai_summary,
        hook_iterations=hook_iterations
        )
