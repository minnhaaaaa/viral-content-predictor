import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:3b"


def call_ollama(prompt: str, max_tokens: int = 300) -> str:
    """
    Sends a prompt to a locally running Ollama instance.
    Returns the generated text. Falls back to empty string on any failure
    so the LLM layer can never break the rest of the pipeline.
    """
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": max_tokens}
            },
            timeout=30
        )
        response.raise_for_status()
        return response.json().get("response", "").strip()
    except Exception as e:
        print(f"Ollama call failed: {e}")
        return ""


def generate_summary(analysis_data: dict) -> str:
    """
    Generates a plain-English summary of the analysis results.
    Only synthesizes existing computed numbers — never invents new scores.
    """
    prompt = f"""You are a short-form video coach. Based on this analysis data, write a 3-4 sentence summary for the creator. Be direct and specific. Mention the composite score, the strongest area, the weakest area, and the single most important thing to fix.

Composite score: {analysis_data['composite_score']}/100
Layer scores: Visual={analysis_data['layer_scores']['neural_visual']}, Audio={analysis_data['layer_scores']['neural_audio']}, Emotional Arc={analysis_data['layer_scores']['emotional_arc']}, Platform Compliance={analysis_data['layer_scores']['platform_compliance']}
Distribution factors: Trend Alignment={analysis_data['distribution']['trend_alignment']}/10, Account Health={analysis_data['distribution']['account_health']}/10, Posting Timing={analysis_data['distribution']['posting_timing']}/10
Number of drift points detected: {len(analysis_data['drift_timestamps'])}

Summary:"""

    result = call_ollama(prompt, max_tokens=200)
    return result if result else "Summary generation unavailable — LLM service not reachable."


def generate_hook_iterations(transcript: str, content_category: str, hook_scores: dict) -> list:
    """
    Generates 2-3 alternative hook suggestions for the opening seconds,
    based on the video's transcript and detected category.
    Returns a list of {label, suggestion} dicts.
    """
    if not transcript:
        transcript_context = "The video has no spoken dialogue — likely music or visual-only content."
    else:
        transcript_context = f"Transcript excerpt: {transcript[:300]}"

    prompt = f"""You are a viral short-form video strategist. {transcript_context}
Content category: {content_category or "general"}
Current hook scores — TikTok: {hook_scores.get('tiktok', 0)}, Reels: {hook_scores.get('reels', 0)}, Shorts: {hook_scores.get('shorts', 0)}

Suggest exactly 3 alternative opening hook lines or concepts for this video's first 3 seconds, each using a different strategy (e.g. curiosity gap, direct address, schema violation/pattern interrupt). Format each as:
1. [Strategy name]: [specific suggestion]
2. [Strategy name]: [specific suggestion]
3. [Strategy name]: [specific suggestion]"""

    result = call_ollama(prompt, max_tokens=300)

    if not result:
        return []

    # Parse numbered list into structured format
    suggestions = []
    for line in result.split("\n"):
        line = line.strip()
        if line and line[0].isdigit():
            # Strip leading number and period
            cleaned = line.split(".", 1)[-1].strip()
            if ":" in cleaned:
                strategy, suggestion = cleaned.split(":", 1)
                suggestions.append({
                    "strategy": strategy.strip(),
                    "suggestion": suggestion.strip()
                })
            else:
                suggestions.append({"strategy": "Suggestion", "suggestion": cleaned})

    return suggestions[:3]
