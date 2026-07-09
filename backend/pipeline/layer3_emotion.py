from functools import lru_cache

import librosa
import nltk
import numpy as np
import whisper
from nltk.sentiment import SentimentIntensityAnalyzer
from silero_vad import get_speech_timestamps, load_silero_vad, read_audio

try:
    nltk.data.find("sentiment/vader_lexicon.zip")
except LookupError:
    nltk.download("vader_lexicon")


HALLUCINATION_BLACKLIST = {
    "music",
    "musical",
    "thank you",
    "thanks for watching",
    "bye",
    "okay",
    "hello",
    "hi",
    "yes",
    "no",
    "um",
    "uh",
    "subscribe",
    "like and subscribe",
    "silence",
    ".",
    "...",
    "you",
    "the",
    "a",
    "applause",
    "laughter",
}


@lru_cache(maxsize=1)
def get_whisper_model():
    return whisper.load_model("tiny")


@lru_cache(maxsize=1)
def get_vad_model():
    return load_silero_vad()


def detect_speech_presence(audio_path: str, min_speech_duration: float = 0.5) -> dict:
    """
    Uses Silero VAD to detect candidate speech regions.
    First-pass filter only — final confirmation happens via validate_transcript().
    """
    model = get_vad_model()
    wav = read_audio(audio_path, sampling_rate=16000)

    speech_timestamps = get_speech_timestamps(
        wav, model, sampling_rate=16000, return_seconds=True
    )

    total_speech_duration = sum(seg["end"] - seg["start"] for seg in speech_timestamps)

    return {
        "has_speech_candidate": total_speech_duration >= min_speech_duration,
        "speech_segments": speech_timestamps,
        "total_speech_duration": round(total_speech_duration, 2),
    }


def transcribe_audio(audio_path: str) -> dict:
    """
    Transcribes audio using Whisper. Includes no_speech_prob per segment
    for hallucination filtering.
    """
    model = get_whisper_model()
    result = model.transcribe(audio_path, verbose=False)

    segments = [
        {
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip(),
            "no_speech_prob": seg.get("no_speech_prob", 0.0),
        }
        for seg in result["segments"]
    ]

    return {"text": result["text"].strip(), "segments": segments}


def validate_transcript(text: str, segments: list) -> bool:
    """
    Rejects transcripts that are likely Whisper hallucinations rather than
    real speech. False positives are worse than false negatives here.
    """
    cleaned = text.strip().lower().strip(".,!?-… ")

    if len(cleaned) == 0:
        return False

    if cleaned in HALLUCINATION_BLACKLIST:
        return False

    word_count = len([w for w in cleaned.split() if w not in HALLUCINATION_BLACKLIST])
    if word_count < 3:
        return False

    if segments:
        avg_no_speech_prob = np.mean([seg["no_speech_prob"] for seg in segments])
        if avg_no_speech_prob > 0.5:
            return False

    return True


def text_sentiment_per_second(segments: list, duration: int) -> list:
    sia = SentimentIntensityAnalyzer()
    valence = [0.0] * duration

    for seg in segments:
        if not seg["text"]:
            continue
        score = sia.polarity_scores(seg["text"])["compound"]

        start_sec = int(seg["start"])
        end_sec = min(int(seg["end"]) + 1, duration)

        for sec in range(start_sec, end_sec):
            valence[sec] = score

    return valence


def audio_arousal_trajectory(audio_path: str, duration: int) -> list:
    """
    Computes per-second audio intensity (arousal) using RMS energy.
    Lightweight proxy for emotional intensity, avoids heavier models
    like SpeechBrain.
    """
    y, sr = librosa.load(audio_path)
    rms = librosa.feature.rms(y=y)[0]

    if len(rms) == 0:
        return [0.0] * duration

    frame_times = librosa.frames_to_time(np.arange(len(rms)), sr=sr)
    per_second = []

    for sec in range(duration):
        mask = (frame_times >= sec) & (frame_times < sec + 1)
        if np.any(mask):
            per_second.append(float(np.mean(rms[mask])))
        else:
            per_second.append(0.0)

    raw = np.array(per_second)
    min_val, max_val = raw.min(), raw.max()
    if max_val - min_val > 1e-6:
        normalized = (raw - min_val) / (max_val - min_val) * 100
    else:
        normalized = np.zeros_like(raw)

    return normalized.tolist()


def arousal_to_valence_proxy(arousal: list) -> list:
    """
    Converts arousal trajectory into a rough valence proxy using rate of change.
    Heuristic only — used to fill gaps where no speech-based sentiment exists.
    """
    if len(arousal) < 2:
        return [0.0] * len(arousal)

    proxy = [0.0]

    for i in range(1, len(arousal)):
        delta = arousal[i] - arousal[i - 1]
        scaled = max(-1.0, min(1.0, delta / 40.0))
        proxy.append(round(scaled, 3))

    return proxy


def combine_valence_signals(
    text_valence: list, audio_valence_proxy: list, has_speech: bool
) -> list:
    """
    Combines text-based valence with audio arousal-derived proxy.
    """
    if not has_speech:
        return audio_valence_proxy

    combined = []
    for t_val, a_val in zip(text_valence, audio_valence_proxy):
        if t_val != 0.0:
            combined.append(t_val)
        else:
            combined.append(round(a_val * 0.5, 3))

    return combined


def analyse_emotion(audio_path: str, duration: int) -> dict:
    """
    Three-stage speech validation (Silero VAD -> Whisper -> hallucination
    filtering) combined with an audio-based arousal/valence proxy for
    seconds or entire clips with no valid speech.
    """
    vad_result = detect_speech_presence(audio_path)

    audio_arousal = audio_arousal_trajectory(audio_path, duration)
    audio_valence_proxy = arousal_to_valence_proxy(audio_arousal)

    if not vad_result["has_speech_candidate"]:
        return {
            "transcript": "",
            "has_speech": False,
            "valence_trajectory": audio_valence_proxy,
            "arousal_trajectory": audio_arousal,
        }

    transcription = transcribe_audio(audio_path)
    is_valid = validate_transcript(transcription["text"], transcription["segments"])

    if not is_valid:
        return {
            "transcript": "",
            "has_speech": False,
            "valence_trajectory": audio_valence_proxy,
            "arousal_trajectory": audio_arousal,
        }

    text_valence = text_sentiment_per_second(transcription["segments"], duration)
    combined_valence = combine_valence_signals(
        text_valence, audio_valence_proxy, has_speech=True
    )

    return {
        "transcript": transcription["text"],
        "has_speech": True,
        "valence_trajectory": combined_valence,
        "arousal_trajectory": audio_arousal,
    }
