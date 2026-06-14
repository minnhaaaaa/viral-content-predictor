import os
import pytest
from backend.utils.video import extract_frames, extract_audio, get_video_metadata

VIDEO_PATH = "tests/sample_uploads/sample.mp4"

def test_get_video_metadata():
    meta = get_video_metadata(VIDEO_PATH)
    assert meta["fps"] > 0
    assert meta["duration"] > 0
    assert meta["width"] > 0
    assert meta["height"] > 0

def test_extract_frames():
    frames = extract_frames(VIDEO_PATH, sample_rate=4.0)
    assert len(frames) > 0
    timestamp, frame = frames[0]
    assert frame.shape[2] == 3 

def test_extract_audio(tmp_path):
    output_path = os.path.join(tmp_path, "audio.wav")
    audio_path = extract_audio(VIDEO_PATH, output_path)
    assert os.path.exists(audio_path)
    assert os.path.getsize(audio_path) > 0