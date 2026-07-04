from backend.utils.video import get_video_metadata

# Platform-specific hook windows in seconds
HOOK_WINDOWS = {"tiktok": 1.8, "reels": 2.5, "shorts": 3.0}

# Platform-specific layer weights
PLATFORM_WEIGHTS = {
    "tiktok": {
        "neural_visual": 0.22,
        "neural_audio": 0.28,
        "emotional_arc": 0.20,
        "platform_compliance": 0.30,
    },
    "reels": {
        "neural_visual": 0.26,
        "neural_audio": 0.12,
        "emotional_arc": 0.24,
        "platform_compliance": 0.38,
    },
    "shorts": {
        "neural_visual": 0.18,
        "neural_audio": 0.11,
        "emotional_arc": 0.22,
        "platform_compliance": 0.49,
    },
}


def compute_hook_scores(visual_output: dict, audio_output: dict) -> dict:
    """
    Scores the opening seconds of the video per platform.
    Uses frame_saliency and motion_energy from visual,
    and bpm_sync and spectral_surprise from audio within the hook window.
    """
    hook_scores = {}

    for platform, window_seconds in HOOK_WINDOWS.items():
        window_frames = int(window_seconds)  # number of seconds to look at

        # Visual signals in hook window
        saliency_window = visual_output["frame_saliency"][:window_frames]
        motion_window = visual_output["motion_energy"][:window_frames]
        face_window = visual_output["face_gaze_pull"][:window_frames]

        # Audio signals in hook window
        surprise_window = audio_output["spectral_surprise"][:window_frames]

        def safe_mean(lst):
            return round(sum(lst) / len(lst), 2) if lst else 0.0

        visual_hook = safe_mean(
            [
                safe_mean(saliency_window),
                safe_mean(motion_window),
                safe_mean(face_window),
            ]
        )

        audio_hook = safe_mean(surprise_window)

        # Hook score is weighted 60% visual, 40% audio
        hook_scores[platform] = round((visual_hook * 0.60) + (audio_hook * 0.40), 2)

    return hook_scores


def compute_platform_compliance(video_path: str) -> dict:
    """
    Checks video format against platform requirements.
    Returns a compliance score 0-100 and a list of issues found.
    """
    meta = get_video_metadata(video_path)
    issues = []
    score = 100.0

    # Check aspect ratio — should be 9:16 vertical (0.5625)
    aspect_ratio = meta["width"] / meta["height"]
    if aspect_ratio > 0.6:
        issues.append(
            "Video is not vertical (9:16). Horizontal or square video gets lower distribution on all three platforms."
        )
        score -= 30

    # Check duration — should be under 90 seconds
    if meta["duration"] > 90:
        issues.append(
            "Video exceeds 90 seconds. TikTok and Reels heavily penalise longer content in short-form feeds."
        )
        score -= 20
    elif meta["duration"] < 5:
        issues.append(
            "Video is under 5 seconds. Too short to build any engagement signal."
        )
        score -= 20

    # Check resolution — should be at least 1080x1920
    if meta["width"] < 1080 or meta["height"] < 1920:
        issues.append(
            "Resolution is below 1080x1920. Low resolution content is deprioritised in platform feeds."
        )
        score -= 15

    # Check FPS — should be at least 24fps
    if meta["fps"] < 24:
        issues.append("Frame rate is below 24fps. Choppy video reduces watch time.")
        score -= 10

    return {
        "compliance_score": max(round(score, 2), 0.0),
        "issues": issues,
        "metadata": {
            "duration": round(meta["duration"], 2),
            "aspect_ratio": round(aspect_ratio, 4),
            "resolution": f"{meta['width']}x{meta['height']}",
            "fps": round(meta["fps"], 2),
        },
    }


def analyse_platform(video_path: str, visual_output: dict, audio_output: dict) -> dict:
    """
    Main entry point for Layer 4.
    Returns hook scores per platform, compliance score, and platform weights.
    """
    hook_scores = compute_hook_scores(visual_output, audio_output)
    compliance = compute_platform_compliance(video_path)

    return {
        "hook_scores": hook_scores,
        "compliance_score": compliance["compliance_score"],
        "compliance_issues": compliance["issues"],
        "video_metadata": compliance["metadata"],
        "platform_weights": PLATFORM_WEIGHTS,
    }
