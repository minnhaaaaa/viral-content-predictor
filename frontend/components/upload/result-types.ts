export interface HookIteration {
  strategy: string
  suggestion: string
}

export interface AnalysisResult {
  composite_score: number
  platform_scores: { tiktok: number; reels: number; shorts: number }
  layer_scores: {
    neural_visual: number
    neural_audio: number
    emotional_arc: number
    platform_compliance: number
  }
  attention_curve: { second: number; score: number }[]
  drift_timestamps: {
    time: number
    severity: "hard" | "soft"
    cause: string
    recommendation: string
  }[]
  emotional_arc: { second: number; valence: number }[]
  hook_score: { tiktok: number; reels: number; shorts: number }
  distribution: {
    trend_alignment: number
    account_health: number
    posting_timing: number
    multiplier: number
    posting_time_recommendation: string
  }
  /** AI-generated (Ollama llama3.2:3b). Best-effort — may be "" if the LLM
   *  service was unreachable. Always check truthiness before rendering. */
  ai_summary: string
  /** AI-generated. Best-effort — may be [] under the same failure condition. */
  hook_iterations: HookIteration[]
}

export const MOCK_RESULT: AnalysisResult = {
  composite_score: 84,
  platform_scores: { tiktok: 87, reels: 81, shorts: 74 },
  layer_scores: {
    neural_visual: 88,
    neural_audio: 79,
    emotional_arc: 91,
    platform_compliance: 52,
  },
  attention_curve: [
    { second: 0, score: 72 }, { second: 1, score: 68 }, { second: 2, score: 45 },
    { second: 3, score: 38 }, { second: 4, score: 22 }, { second: 5, score: 48 },
    { second: 6, score: 61 }, { second: 7, score: 74 }, { second: 8, score: 79 },
    { second: 9, score: 82 }, { second: 10, score: 75 }, { second: 11, score: 63 },
    { second: 12, score: 55 }, { second: 13, score: 44 }, { second: 14, score: 38 },
    { second: 15, score: 19 }, { second: 16, score: 32 }, { second: 17, score: 51 },
    { second: 18, score: 67 }, { second: 19, score: 73 },
  ],
  drift_timestamps: [
    { time: 4.0, severity: "hard", cause: "Motion energy drops with no audio beat", recommendation: "Insert a cut or sound effect here" },
    { time: 15.0, severity: "hard", cause: "Emotional valence flatlines", recommendation: "Raise tension or introduce a new element" },
  ],
  emotional_arc: [
    { second: 0, valence: -0.2 }, { second: 1, valence: 0.1 }, { second: 2, valence: 0.4 },
    { second: 3, valence: 0.6 }, { second: 4, valence: 0.3 }, { second: 5, valence: 0.1 },
    { second: 6, valence: -0.1 }, { second: 7, valence: 0.2 }, { second: 8, valence: 0.5 },
    { second: 9, valence: 0.7 }, { second: 10, valence: 0.8 }, { second: 11, valence: 0.6 },
    { second: 12, valence: 0.4 }, { second: 13, valence: 0.1 }, { second: 14, valence: -0.1 },
    { second: 15, valence: -0.3 }, { second: 16, valence: 0.0 }, { second: 17, valence: 0.3 },
    { second: 18, valence: 0.6 }, { second: 19, valence: 0.9 },
  ],
  hook_score: { tiktok: 91, reels: 85, shorts: 79 },
  distribution: {
    trend_alignment: 8,
    account_health: 6,
    posting_timing: 4,
    multiplier: 1.27,
    posting_time_recommendation: "Post between 7:00 PM and 10:00 PM GST",
  },
  ai_summary: "This video scores 84/100, driven largely by a strong emotional arc (91) and solid visual hook. The weakest area is platform compliance (52) — the aspect ratio isn't fully optimized for vertical feeds. Fixing the crop before posting is the single highest-impact change available.",
  hook_iterations: [
    { strategy: "Curiosity gap",    suggestion: "Open on the finished result before showing how you got there." },
    { strategy: "Direct address",   suggestion: "Start with 'If you've ever struggled with X, watch this.'" },
    { strategy: "Pattern interrupt",suggestion: "Open mid-action with no context, let the confusion pull viewers in." },
  ],
}
