export interface LocationResult {
  city: string;
  country: string;
  country_code: string;
  lat: number;
  lon: number;
  population?: number;
  display_name: string;
}

export interface AnalysisFormData {
  followerCount: string;
  daysSinceUpload: string;
  avgViews: string;
  platform: string | null;
  contentKeywords: string;
  contentCategory: string | null;
  audioTrack: string;
  location: LocationResult | null;
  postTime: string;
}

export const PLATFORM_OPTIONS = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram Reels" },
  { id: "youtube", label: "YouTube Shorts" },
];

export const CATEGORY_OPTIONS = [
  { id: "fitness", label: "Fitness & Health" },
  { id: "food", label: "Food & Cooking" },
  { id: "fashion", label: "Fashion & Beauty" },
  { id: "comedy", label: "Comedy & Entertainment" },
  { id: "education", label: "Education & Explainer" },
  { id: "travel", label: "Travel & Lifestyle" },
  { id: "tech", label: "Tech & Gaming" },
  { id: "finance", label: "Finance & Business" },
];
