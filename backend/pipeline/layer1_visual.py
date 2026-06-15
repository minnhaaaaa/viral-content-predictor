import cv2
import numpy as np

def frame_saliency_score(frames):
    """
    Returns a list of saliency scores, four per sampled frame, scaled 0-100.
    Since extract_frames samples at 4fps, this returns 4 values per second of video, not 1. 
    """
    saliency_detector = cv2.saliency.StaticSaliencySpectralResidual_create()
    raw_scores = []

    for timestamp, frame in frames:
        success, saliency_map = saliency_detector.computeSaliency(frame)
        if success:
            raw_scores.append(float(np.mean(saliency_map)))
        else:
            raw_scores.append(0.0)

    # Normalise to 0-100 relative to this video's own range
    raw_scores = np.array(raw_scores)
    min_val, max_val = raw_scores.min(), raw_scores.max()
    if max_val - min_val > 1e-6:
        normalized = (raw_scores - min_val) / (max_val - min_val) * 100
    else:
        normalized = np.zeros_like(raw_scores)

    return normalized.tolist()

import cv2
import numpy as np

def luminance_shock_score(frames):
    """
    Returns a list of luminance shock scores, one per sampled frame, scaled 0-100
    """
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