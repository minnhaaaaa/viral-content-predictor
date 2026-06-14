import cv2
import numpy as np
import os
from moviepy import VideoFileClip

def extract_frames(video_path: str, sample_rate: float = 4.0):
    " Returns a list of (timestamp, frame) tuples."

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(fps / sample_rate)
    
    frames = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % frame_interval == 0:
            timestamp = frame_count / fps
            frames.append((timestamp, frame))
        frame_count += 1
    
    cap.release()
    return frames

def extract_audio(video_path: str, output_path: str = "temp_audio.wav"):
    "Returns the path to the extracted audio WAV file."

    video = VideoFileClip(video_path)
    video.audio.write_audiofile(output_path, logger=None)
    video.close()
    return output_path

def get_video_metadata(video_path: str):
    "Returns basic metadata about the video."

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = frame_count / fps
    cap.release()
    
    return {
        "fps": fps,
        "frame_count": frame_count,
        "width": width,
        "height": height,
        "duration": duration,
        "aspect_ratio": round(width / height, 2)
    }