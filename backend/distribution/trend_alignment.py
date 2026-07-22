import numpy as np
from pytrends.request import TrendReq
import time
import spacy
from functools import lru_cache

@lru_cache(maxsize=1)
def get_nlp_model():
    return spacy.load("en_core_web_sm")

def extract_topic_keywords(transcript: str, caption: str = "", max_keywords: int = 5) -> list:
    """
    Extracts candidate topic keywords from the video's transcript and caption
    using noun phrase extraction. This automates topic detection instead of
    relying solely on manually typed creator keywords.
    """
    combined_text = f"{caption}. {transcript}".strip()

    if len(combined_text) < 5:
        return []

    nlp = get_nlp_model()
    doc = nlp(combined_text)

    # Extract noun phrases, filter out very short or very generic ones
    candidates = []
    seen = set()

    for chunk in doc.noun_chunks:
        phrase = chunk.text.strip().lower()
        # Skip pronouns, single letter words, and duplicates
        if len(phrase) < 3 or phrase in seen:
            continue
        # Skip phrases that are just stopwords
        if all(token.is_stop for token in chunk):
            continue
        seen.add(phrase)
        candidates.append(phrase)

    return candidates[:max_keywords]

def get_trend_slope(keyword: str, timeframe: str = "now 7-d") -> dict:
    """
    Queries Google Trends for a single keyword's search interest over the
    last 7 days and fits a linear slope through it.
    Rising slope = trending up. Flat or negative = not trending.
    Returns raw slope and the time series for debugging/display.
    """
    try:
        pytrends = TrendReq(hl='en-US', tz=360)
        pytrends.build_payload([keyword], cat=0, timeframe=timeframe, geo='', gprop='')
        data = pytrends.interest_over_time()

        if data.empty or keyword not in data.columns:
            return {"keyword": keyword, "slope": 0.0, "series": [], "error": None}

        series = data[keyword].tolist()

        if len(series) < 2:
            return {"keyword": keyword, "slope": 0.0, "series": series, "error": None}

        x = np.arange(len(series))
        y = np.array(series)
        slope, _ = np.polyfit(x, y, 1)

        return {"keyword": keyword, "slope": float(slope), "series": series, "error": None}

    except Exception as e:
        return {"keyword": keyword, "slope": 0.0, "series": [], "error": str(e)}


def score_trend_alignment(
    keywords: list,
    transcript: str = "",
    caption: str = "",
    delay_between_queries: float = 1.0
) -> dict:
    """
    Queries Google Trends for creator-provided keywords AND auto-extracted
    topic keywords from the transcript/caption. Scores based on both the
    trend's slope (is it rising) and its absolute interest level (is it
    already significant), since a topic rising from 0->5 is a much weaker
    signal than one rising from 40->70.
    """
    auto_keywords = extract_topic_keywords(transcript, caption)
    all_keywords = list(dict.fromkeys(keywords + auto_keywords))  # dedupe, preserve order

    if not all_keywords:
        return {
            "score": 0.0,
            "best_keyword": None,
            "keyword_results": [],
            "auto_extracted": auto_keywords,
            "reason": "No keywords provided or extracted."
        }

    results = []
    for i, kw in enumerate(all_keywords):
        result = get_trend_slope(kw)
        results.append(result)
        if i < len(all_keywords) - 1:
            time.sleep(delay_between_queries)

    valid_results = [r for r in results if r["error"] is None]

    if not valid_results:
        return {
            "score": 0.0,
            "best_keyword": None,
            "keyword_results": results,
            "auto_extracted": auto_keywords,
            "reason": "All keyword queries failed — Google Trends may be rate limiting or unreachable."
        }

    # Score each result combining slope (trend direction) and average level (significance)
    def combined_score(r):
        avg_level = float(np.mean(r["series"])) if r["series"] else 0.0
        # Slope contributes direction, level contributes magnitude of relevance
        return (r["slope"] * 0.7) + (avg_level * 0.05)  # level scaled down, it's 0-100 range

    best = max(valid_results, key=combined_score)
    best_avg_level = float(np.mean(best["series"])) if best["series"] else 0.0

    # Normalise combined score to 0-10
    raw_combined = combined_score(best)
    normalized_score = max(0.0, min(10.0, 5.0 + (raw_combined / 3.0)))

    if best["slope"] > 2 and best_avg_level > 40:
        reason = f"'{best['keyword']}' is both highly searched and trending up sharply — strong distribution signal."
    elif best["slope"] > 2:
        reason = f"'{best['keyword']}' is trending up sharply, though overall search volume is still building."
    elif best["slope"] > 0:
        reason = f"'{best['keyword']}' is trending up slightly."
    elif best["slope"] == 0:
        reason = f"'{best['keyword']}' shows flat or no search interest."
    else:
        reason = f"'{best['keyword']}' is declining in search interest."

    return {
        "score": round(normalized_score, 2),
        "best_keyword": best["keyword"],
        "keyword_results": results,
        "auto_extracted": auto_keywords,
        "reason": reason
    }
