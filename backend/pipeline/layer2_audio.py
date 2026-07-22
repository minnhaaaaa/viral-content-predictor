import cv2
import librosa
import numpy as np
import parselmouth
from skimage.metrics import structural_similarity as ssim


def detect_cuts(
    video_path: str,
    sample_rate: float = 4.0,
    ssim_drop_factor: float = 0.7,
    hist_drop_factor: float = 0.85,
    window: int = 5,
) -> list:
    """
    Detects cuts using both SSIM (structural/spatial change) and histogram
    correlation (colour distribution change) in a single pass over the video.
    A cut is flagged if EITHER signal shows a sharp local drop, since they
    catch different kinds of cuts:
      - SSIM catches same-lighting perspective/angle changes
      - Histogram correlation catches differently-lit scene changes
    Returns a sorted list of unique cut timestamps in seconds.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"OpenCV could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0
    frame_interval = max(int(fps / sample_rate), 1)

    ssim_scores = []
    hist_scores = []
    timestamps = []

    prev_gray = None
    prev_hist = None
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            timestamp = frame_count / fps

            small_frame = cv2.resize(frame, (160, 90))
            gray = cv2.cvtColor(small_frame, cv2.COLOR_BGR2GRAY)

            hist = cv2.calcHist(
                [frame], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256]
            )
            hist = cv2.normalize(hist, hist).flatten()

            if prev_gray is not None:
                s_score = ssim(prev_gray, gray)
                h_score = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL)

                ssim_scores.append(s_score)
                hist_scores.append(h_score)
                timestamps.append(timestamp)

            prev_gray = gray
            prev_hist = hist

        frame_count += 1

    cap.release()

    if len(ssim_scores) < 3:
        return []

    ssim_scores = np.array(ssim_scores)
    hist_scores = np.array(hist_scores)
    cut_timestamps = set()

    for i in range(len(ssim_scores)):
        start = max(0, i - window)

        # SSIM check
        ssim_local_avg = np.mean(ssim_scores[start:i]) if i > start else ssim_scores[i]
        if ssim_local_avg > 0 and ssim_scores[i] < ssim_local_avg * ssim_drop_factor:
            cut_timestamps.add(timestamps[i])

        # Histogram correlation check
        hist_local_avg = np.mean(hist_scores[start:i]) if i > start else hist_scores[i]
        if hist_local_avg > 0 and hist_scores[i] < hist_local_avg * hist_drop_factor:
            cut_timestamps.add(timestamps[i])

    return sorted(cut_timestamps)


def detect_cuts_debug_ssim(video_path: str, sample_rate: float = 4.0):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0
    frame_interval = max(int(fps / sample_rate), 1)

    prev_gray = None
    frame_count = 0
    results = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            timestamp = frame_count / fps
            small_frame = cv2.resize(frame, (160, 90))
            gray = cv2.cvtColor(small_frame, cv2.COLOR_BGR2GRAY)

            if prev_gray is not None:
                score = ssim(prev_gray, gray)
                results.append((round(timestamp, 2), round(score, 3)))

            prev_gray = gray

        frame_count += 1

    cap.release()
    return results


# Uncomment to get detailed cut info
# results = detect_cuts_debug_ssim("tests/sample_uploads/sample.mp4")
# for t, s in results:
#    print(f"t={t}s  ssim={s}")


def loudness_dynamics_score(audio_path: str) -> dict:
    """
    Measures loudness variation using RMS energy.
    Flat audio hurts engagement; variation keeps it alive.
    Returns average loudness, variance score, and peak count, all 0-100 scaled.
    """
    y, sr = librosa.load(audio_path)
    rms = librosa.feature.rms(y=y)[0]

    if len(rms) == 0:
        return {"avg_loudness": 0.0, "loudness_variance": 0.0, "peak_count": 0}

    avg_loudness = float(np.mean(rms))
    variance = float(np.std(rms))

    # Peak count: local maxima above 1.5x the mean RMS
    threshold = avg_loudness * 1.5
    peaks = np.sum(
        (rms[1:-1] > rms[:-2]) & (rms[1:-1] > rms[2:]) & (rms[1:-1] > threshold)
    )

    # Normalise variance to 0-100 heuristically (typical RMS std range 0-0.15)
    variance_score = min(variance / 0.15, 1.0) * 100

    return {
        "avg_loudness": round(avg_loudness, 4),
        "loudness_variance": round(variance_score, 2),
        "peak_count": int(peaks),
    }


def silence_ratio_score(audio_path: str) -> dict:
    """
    Measures how much of the audio is silence/dead air.
    High silence ratio hurts retention.
    Returns silence percentage and longest silence gap in seconds.
    """
    y, sr = librosa.load(audio_path)
    total_duration = librosa.get_duration(y=y, sr=sr)

    if total_duration == 0:
        return {"silence_ratio": 0.0, "longest_silence_seconds": 0.0}

    # Split audio into non-silent intervals (top_db=30 is a reasonable speech threshold)
    intervals = librosa.effects.split(y, top_db=30)

    non_silent_duration = sum((end - start) for start, end in intervals) / sr
    silence_duration = total_duration - non_silent_duration
    silence_ratio = (silence_duration / total_duration) * 100

    # Find longest gap between non-silent intervals
    longest_gap = 0.0
    for i in range(len(intervals) - 1):
        gap = (intervals[i + 1][0] - intervals[i][1]) / sr
        longest_gap = max(longest_gap, gap)

    return {
        "silence_ratio": round(float(silence_ratio), 2),
        "longest_silence_seconds": round(float(longest_gap), 2),
    }


def bpm_sync_score(
    audio_path: str, video_path: str, alignment_window: float = 0.15
) -> float:
    """
    Measures whether visual cuts align with musical beats.
    Uses proper cut detection via SSIM + histogram correlation.
    alignment_window: how close (in seconds) a cut needs to be to a beat to count as aligned.
    Wider window is more forgiving of expressive/rubato timing where notes
    don't fall exactly on a strict metronomic grid.
    Returns a single score 0-100.
    """
    y, sr = librosa.load(audio_path)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)

    if len(beat_times) == 0:
        return 0.0

    cut_timestamps = detect_cuts(video_path)

    if not cut_timestamps:
        return 0.0

    aligned_count = 0
    for cut_time in cut_timestamps:
        if np.any(np.abs(beat_times - cut_time) < alignment_window):
            aligned_count += 1

    score = (aligned_count / len(cut_timestamps)) * 100
    return round(float(score), 2)


def spectral_surprise_index(audio_path: str, duration: int) -> list:
    """
    Measures audio novelty using librosa's onset strength envelope.
    Returns a list of scores, one per second, scaled 0-100.
    """
    y, sr = librosa.load(audio_path)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)

    if len(onset_env) == 0:
        return [0.0] * duration

    frame_times = librosa.frames_to_time(np.arange(len(onset_env)), sr=sr)
    per_second_scores = []

    for sec in range(duration):
        mask = (frame_times >= sec) & (frame_times < sec + 1)
        if np.any(mask):
            per_second_scores.append(float(np.mean(onset_env[mask])))
        else:
            per_second_scores.append(0.0)

    raw_scores = np.array(per_second_scores)
    min_val, max_val = raw_scores.min(), raw_scores.max()
    if max_val - min_val > 1e-6:
        normalized = (raw_scores - min_val) / (max_val - min_val) * 100
    else:
        normalized = np.zeros_like(raw_scores)

    return normalized.tolist()

def voice_prosody_score(audio_path: str, has_speech: bool = True) -> float:
    """
    Measures pitch range and variation using Praat via parselmouth.
    Only meaningful when speech is present — returns 0.0 otherwise,
    since Praat's pitch tracker cannot distinguish voice from instruments.
    """
    if not has_speech:
        return 0.0

    try:
        snd = parselmouth.Sound(audio_path)
        pitch = snd.to_pitch()
        pitch_values = pitch.selected_array["frequency"]
        pitch_values = pitch_values[pitch_values != 0]

        if len(pitch_values) == 0:
            return 0.0

        pitch_range = float(np.max(pitch_values) - np.min(pitch_values))
        pitch_std = float(np.std(pitch_values))

        range_score = min(pitch_range / 200.0, 1.0) * 100
        variation_score = min(pitch_std / 50.0, 1.0) * 100

        score = (range_score * 0.5) + (variation_score * 0.5)
        return round(score, 2)

    except Exception:
        return 0.0


def analyse_audio(audio_path: str, video_path: str, duration: int, has_speech: bool = True) -> dict:
    """
    Runs all audio metrics and returns combined results.
    has_speech: passed from Layer 3's Silero VAD + Whisper validation,
    used to gate voice_prosody_score so it doesn't misfire on instrumental audio.
    """
    loudness = loudness_dynamics_score(audio_path)
    silence = silence_ratio_score(audio_path)

    return {
        "bpm_sync": bpm_sync_score(audio_path, video_path, alignment_window=0.15),
        "spectral_surprise": spectral_surprise_index(audio_path, duration),
        "voice_prosody": voice_prosody_score(audio_path, has_speech),
        "avg_loudness": loudness["avg_loudness"],
        "loudness_variance": loudness["loudness_variance"],
        "peak_count": loudness["peak_count"],
        "silence_ratio": silence["silence_ratio"],
        "longest_silence_seconds": silence["longest_silence_seconds"],
    }
