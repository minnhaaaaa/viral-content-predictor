from functools import lru_cache

import cv2
import numpy as np
from insightface.app import FaceAnalysis

from backend.utils.video import extract_frames


def frame_saliency_score(frames):
    """
    Returns a list of saliency scores, four per sampled frame, scaled 0-100.
    Since extract_frames samples at 4fps, this returns 4 values per second of video, not 1.
    """
    if not frames:
        return []
    raw_scores = []

    saliency_detector = cv2.saliency.StaticSaliencySpectralResidual_create()

    for timestamp, frame in frames:
        success, saliency_map = saliency_detector.computeSaliency(frame)
        if success:
            raw_scores.append(float(np.mean(saliency_map)))
        else:
            raw_scores.append(0.0)

    if not raw_scores:
        return []

    # Normalise to 0-100 relative to this video's own range
    raw_scores = np.array(raw_scores)
    min_val, max_val = raw_scores.min(), raw_scores.max()
    if max_val - min_val > 1e-6:
        normalized = (raw_scores - min_val) / (max_val - min_val) * 100
    else:
        normalized = np.zeros_like(raw_scores)

    return normalized.tolist()


def luminance_shock_score(frames):
    """
    Returns a list of luminance shock scores, one per sampled frame, scaled 0-100
    """
    if not frames:
        return []
    raw_scores = [0.0]
    prev_hist = None

    for timestamp, frame in frames:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = cv2.normalize(hist, hist).flatten()

        if prev_hist is not None:
            diff = np.sum(np.abs(hist - prev_hist))
            raw_scores.append(diff)

        prev_hist = hist

    raw_scores = np.array(raw_scores)
    min_val, max_val = raw_scores.min(), raw_scores.max()
    if max_val - min_val > 1e-6:
        normalized = (raw_scores - min_val) / (max_val - min_val) * 100
    else:
        normalized = np.zeros_like(raw_scores)

    return normalized.tolist()


def motion_energy_index(frames):
    if not frames:
        return []
    raw_scores = [0.0]
    prev_gray = None

    for timestamp, frame in frames:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_gray is not None:
            flow = cv2.calcOpticalFlowFarneback(
                prev_gray,
                gray,
                None,
                pyr_scale=0.5,
                levels=3,
                winsize=15,
                iterations=3,
                poly_n=5,
                poly_sigma=1.2,
                flags=0,
            )
            magnitude, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
            raw_scores.append(float(np.mean(magnitude)))

        prev_gray = gray

    raw_scores = np.array(raw_scores)
    min_val, max_val = raw_scores.min(), raw_scores.max()
    if max_val - min_val > 1e-6:
        normalized = (raw_scores - min_val) / (max_val - min_val) * 100
    else:
        normalized = np.zeros_like(raw_scores)

    return normalized.tolist()


def colour_valence_index(frames):
    if not frames:
        return []
    raw_scores = []

    for timestamp, frame in frames:
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)

        # Warm hues: 0-30 and 150-180 in OpenCV's 0-180 hue range
        # OpenCV maps 0-360 degrees to 0-180, so divide thresholds by 2
        warm_mask = (
            ((h >= 0) & (h <= 30))  # red to yellow orange
            | ((h >= 165) & (h <= 179))  # red wrapping around
        )

        # High saturation mask: above 80 out of 255
        high_sat_mask = s > 80

        # Combined: warm and saturated
        warm_saturated = warm_mask & high_sat_mask
        score = float(np.sum(warm_saturated) / h.size)  # proportion of pixels
        raw_scores.append(score)

    if not raw_scores:
        return []

    raw_scores = np.array(raw_scores)
    min_val, max_val = raw_scores.min(), raw_scores.max()
    if max_val - min_val > 1e-6:
        normalized = (raw_scores - min_val) / (max_val - min_val) * 100
    else:
        normalized = np.zeros_like(raw_scores)

    return normalized.tolist()


@lru_cache(maxsize=1)
def get_face_app():
    app = FaceAnalysis(name="buffalo_l")
    app.prepare(ctx_id=-1, det_size=(640, 640))
    return app


def face_gaze_pull_score(frames):
    if not frames:
        return []

    face_app = get_face_app()
    raw_scores = []

    for timestamp, frame in frames:
        h, w = frame.shape[:2]
        faces = face_app.get(frame)

        if len(faces) == 0:
            raw_scores.append(0.0)
            continue

        face = max(
            faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1])
        )

        x1, y1, x2, y2 = face.bbox.astype(float)
        face_area = (x2 - x1) * (y2 - y1)
        frame_area = w * h
        face_size_score = min(face_area / (frame_area * 0.25), 1.0)

        face_cx = (x1 + x2) / 2
        frame_cx = w / 2
        center_offset = abs(face_cx - frame_cx) / w
        center_score = max(0.0, 1.0 - 2.0 * center_offset)

        left_eye = face.kps[0]
        right_eye = face.kps[1]
        nose = face.kps[2]
        eye_mid = (left_eye + right_eye) / 2
        eye_dist = np.linalg.norm(right_eye - left_eye)

        if eye_dist > 1e-6:
            yaw_proxy = abs(nose[0] - eye_mid[0]) / eye_dist
            gaze_score = max(0.0, 1.0 - 2.2 * yaw_proxy)
        else:
            gaze_score = 0.5

        score = 0.50 * face_size_score + 0.20 * center_score + 0.30 * gaze_score
        raw_scores.append(score)

    raw_scores = np.array(raw_scores)
    if np.sum(raw_scores) == 0:
        return [0.0] * len(frames)

    min_val, max_val = raw_scores.min(), raw_scores.max()
    if max_val - min_val > 1e-6:
        normalized = (raw_scores - min_val) / (max_val - min_val) * 100
    else:
        normalized = np.zeros_like(raw_scores)

    return normalized.tolist()


def aggregate_to_seconds(scores: list, sample_rate: float = 4.0) -> list:
    """
    Averages every sample_rate values into one value per second.
    """
    chunk_size = int(sample_rate)
    result = []
    for i in range(0, len(scores), chunk_size):
        chunk = scores[i : i + chunk_size]
        result.append(round(float(np.mean(chunk)), 4))
    return result


def analyse_visual(video_path: str) -> dict:
    """
    Returns one score per second for each.
    """
    frames = extract_frames(video_path, sample_rate=4.0)

    saliency_scores = frame_saliency_score(frames)
    shock_scores = luminance_shock_score(frames)
    motion_scores = motion_energy_index(frames)
    colour_scores = colour_valence_index(frames)
    face_scores = face_gaze_pull_score(frames)

    result = {
        "frame_saliency": aggregate_to_seconds(saliency_scores),
        "luminance_shock": aggregate_to_seconds(shock_scores),
        "motion_energy": aggregate_to_seconds(motion_scores),
        "colour_valence": aggregate_to_seconds(colour_scores),
        "face_gaze_pull": aggregate_to_seconds(face_scores),
    }

    lengths = {k: len(v) for k, v in result.items()}
    assert len(set(lengths.values())) == 1, f"Signal length mismatch: {lengths}"

    return result
