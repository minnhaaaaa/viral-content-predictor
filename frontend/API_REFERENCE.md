# XenrexAI — Frontend ↔ Backend API Reference

This is what the frontend actually sends and expects back. Keep this in sync
with your FastAPI (or equivalent) backend at `http://localhost:8000`.

---

## REQUEST

**Endpoint:** `POST /analyse`
**Content-Type:** `multipart/form-data`
**Called from:** `lib/api.ts` → `analyseVideo()`

### Form fields

| Field                    | Type   | Example              | Notes                                                   |
|--------------------------|--------|-----------------------|----------------------------------------------------------|
| `video`                  | File   | `my-edit.mp4`         | The actual video file, binary                             |
| `platform`               | string | `"tiktok"`            | One of `tiktok`, `instagram`, `youtube`                   |
| `keywords`                | string | `"fitness,workout,gym"` | Comma-separated, from the content keywords field         |
| `target_country`         | string | `"India"`             | Free text, from audience location field                   |
| `intended_posting_time`  | string | `"08:00"`             | 24hr `HH:MM`, from the time input                          |
| `follower_count`         | string | `"5000"`              | Sent as string (FormData always stringifies); parse server-side |
| `avg_views_last_10`      | string | `"800"`               | Same as above                                              |
| `days_since_last_post`   | string | `"2"`                 | Same as above                                              |
| `content_category`       | string | `"fitness"`           | Optional — only sent if the user picked one                |
| `audio_track`            | string | `"Flowers — Miley Cyrus"` | Optional — only sent if the user filled it in         |

### Example request (what actually goes over the wire)

```js
const formData = new FormData();
formData.append("video", videoFile);
formData.append("platform", "tiktok");
formData.append("keywords", "fitness,workout,gym");
formData.append("target_country", "India");
formData.append("intended_posting_time", "08:00");
formData.append("follower_count", "5000");
formData.append("avg_views_last_10", "800");
formData.append("days_since_last_post", "2");
formData.append("content_category", "fitness");     // optional
formData.append("audio_track", "Flowers — Miley Cyrus"); // optional

const response = await fetch("http://localhost:8000/analyse", {
  method: "POST",
  body: formData,
});
```

---

## RESPONSE — success (HTTP 200)

**Content-Type:** `application/json`
**Shape expected by the frontend** (`AnalysisResult` in `components/upload/result-types.ts`):

```json
{
  "composite_score": 84,
  "platform_scores": {
    "tiktok": 87,
    "reels": 81,
    "shorts": 74
  },
  "layer_scores": {
    "neural_visual": 88,
    "neural_audio": 79,
    "emotional_arc": 91,
    "platform_compliance": 52
  },
  "attention_curve": [
    { "second": 0, "score": 72 },
    { "second": 1, "score": 68 },
    { "second": 2, "score": 45 }
  ],
  "drift_timestamps": [
    {
      "time": 4.0,
      "severity": "hard",
      "cause": "Motion energy drops with no audio beat",
      "recommendation": "Insert a cut or sound effect here"
    }
  ],
  "emotional_arc": [
    { "second": 0, "valence": -0.2 },
    { "second": 1, "valence": 0.1 }
  ],
  "hook_score": {
    "tiktok": 91,
    "reels": 85,
    "shorts": 79
  },
  "distribution": {
    "trend_alignment": 8,
    "account_health": 6,
    "posting_timing": 4,
    "multiplier": 1.27,
    "posting_time_recommendation": "Post between 7:00 PM and 10:00 PM GST"
  }
}
```

### Field-by-field contract

| Field | Type | Constraints |
|---|---|---|
| `composite_score` | number | 0–100 |
| `platform_scores.{tiktok,reels,shorts}` | number | 0–100 each |
| `layer_scores.{neural_visual,neural_audio,emotional_arc,platform_compliance}` | number | 0–100 each |
| `attention_curve` | array of `{ second: number, score: number }` | `score` 0–100, `second` should be sequential starting at 0 |
| `drift_timestamps` | array of `{ time: number, severity: "hard" \| "soft", cause: string, recommendation: string }` | `severity` must be exactly `"hard"` or `"soft"` |
| `emotional_arc` | array of `{ second: number, valence: number }` | `valence` should be roughly -1 to 1 |
| `hook_score.{tiktok,reels,shorts}` | number | 0–100 each |
| `distribution.{trend_alignment,account_health,posting_timing}` | number | 0–10 each |
| `distribution.multiplier` | number | e.g. 1.27 |
| `distribution.posting_time_recommendation` | string | plain-English sentence |

**Important:** if any field is missing or the wrong type, the frontend will still render the page but will show `undefined`/`NaN` in that spot rather than crashing — but it will look broken. Match the shape exactly.

---

## RESPONSE — error (non-2xx)

The frontend tries to parse the error body as JSON and looks for (checked in this order):
1. `{ "detail": "..." }` — FastAPI's default `HTTPException` shape
2. `{ "error": "..." }`
3. `{ "message": "..." }`

If none of those keys exist, it falls back to showing `Server returned {status_code}`.

### Example FastAPI error response
```json
{
  "detail": "Video file exceeds 60 second limit"
}
```
→ Frontend shows: **"Server error 400"** with body text **"Video file exceeds 60 second limit"**

### Recommended status codes
| Situation | Status | Body |
|---|---|---|
| Video too long / bad format | 400 | `{ "detail": "..." }` |
| Video processing failed | 422 | `{ "detail": "..." }` |
| Rate limited | 429 | `{ "detail": "Too many requests, try again in Ns" }` |
| Internal error | 500 | `{ "detail": "Something went wrong on our end" }` |

---

## Frontend error handling (already implemented)

`lib/api.ts` classifies every failure into one of four kinds, and
`components/upload/analysis-stage.tsx` renders a dedicated error screen for each:

| Kind | Trigger | User sees |
|---|---|---|
| `network` | `fetch()` throws (backend down, CORS blocked, DNS fail) | "Cannot reach backend" + a checklist (backend running? CORS enabled? firewall?) |
| `timeout` | Request aborted via `AbortController` | "Request timed out" |
| `server` | HTTP status is not 2xx | "Server error {status}" + the parsed detail message |
| `parse` | Response body isn't valid JSON | "Unexpected response" |

Every error screen has a **Try again** button that re-submits the exact same
file + form data.

---

## CORS reminder

Since the frontend runs on `localhost:3000` (or wherever Next.js dev serves)
and the backend is on `localhost:8000`, you need CORS enabled on the backend,
e.g. in FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)
```

Without this, every request will fail with a `network` error on the frontend
even though the backend is technically running and reachable directly.
