import { AnalysisResult } from "@/components/upload/result-types";
import { AnalysisFormData, LocationResult } from "@/components/upload/types";

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
  body.append("target_location_lat",    String(form.location?.lat ?? ""));
  body.append("target_location_lon",    String(form.location?.lon ?? ""));
  body.append("target_location_label",  form.location?.display_name ?? "");
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

export type LocationSearchResult =
  | { ok: true; results: LocationResult[] }
  | { ok: false; error: ApiError };

/**
 * GET /locations/search?q=... — debounced city autocomplete.
 * Unlike the old version, this reports *why* a search failed (network
 * down, non-2xx, bad JSON) instead of silently returning [] for every
 * failure mode — that made "backend unreachable" indistinguishable from
 * "no cities match this query" in the UI.
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<LocationSearchResult> {
  if (query.trim().length < 2) return { ok: true, results: [] };

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE}/locations/search?q=${encodeURIComponent(query)}`,
      { signal }
    );
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: { kind: "timeout", message: "Search cancelled." } };
    }
    const msg = err instanceof Error ? err.message : "Network request failed";
    return {
      ok: false,
      error: {
        kind: "network",
        message: `Could not reach the XenrexAI backend at ${API_BASE}. (${msg})`,
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
    return { ok: false, error: { kind: "server", status: response.status, message: serverMessage } };
  }

  try {
    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    return { ok: true, results };
  } catch {
    return { ok: false, error: { kind: "parse", message: "The server returned invalid JSON for the location search." } };
  }
}

/**
 * GET /health — used for an optional "backend reachable" check.
 */
export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}
