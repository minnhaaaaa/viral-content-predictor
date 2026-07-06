import { AnalysisResult } from "@/components/upload/result-types";
import { AnalysisFormData } from "@/components/upload/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ApiError =
  | { kind: "network";  message: string }
  | { kind: "timeout";  message: string }
  | { kind: "server";   status: number; message: string }
  | { kind: "parse";    message: string };

export type ApiResult =
  | { ok: true;  data: AnalysisResult }
  | { ok: false; error: ApiError };

/**
 * Submit a video + metadata to the backend /analyse endpoint.
 * Returns a discriminated union — caller handles both branches.
 */
export async function analyseVideo(
  videoFile: File,
  form: AnalysisFormData,
  signal?: AbortSignal
): Promise<ApiResult> {
  const body = new FormData();
  body.append("video", videoFile);
  body.append("platform",               form.platform ?? "tiktok");
  body.append("keywords",               form.contentKeywords ?? "");
  body.append("target_country",         form.audienceLocation ?? "");
  body.append("intended_posting_time",  form.postTime ?? "");
  body.append("follower_count",         form.followerCount || "0");
  body.append("avg_views_last_10",      form.avgViews || "0");
  body.append("days_since_last_post",   form.daysSinceUpload || "0");
  if (form.contentCategory) body.append("content_category", form.contentCategory);
  if (form.audioTrack)      body.append("audio_track",      form.audioTrack);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/analyse`, {
      method: "POST",
      body,
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: { kind: "timeout", message: "Request was cancelled." } };
    }
    const msg = err instanceof Error ? err.message : "Network request failed";
    return {
      ok: false,
      error: {
        kind: "network",
        message: `Could not reach the XenrexAI backend. Make sure it is running at ${API_BASE}. (${msg})`,
      },
    };
  }

  if (!response.ok) {
    let serverMessage = `Server returned ${response.status}`;
    try {
      const json = await response.json();
      if (json?.detail) serverMessage = json.detail;
      else if (json?.error) serverMessage = json.error;
      else if (json?.message) serverMessage = json.message;
    } catch { /* ignore parse error on error body */ }
    return {
      ok: false,
      error: { kind: "server", status: response.status, message: serverMessage },
    };
  }

  let data: AnalysisResult;
  try {
    data = await response.json() as AnalysisResult;
  } catch {
    return {
      ok: false,
      error: { kind: "parse", message: "The server responded but returned invalid JSON." },
    };
  }

  return { ok: true, data };
}
