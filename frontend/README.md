# XenrexAI — Next.js + shadcn + Tailwind + TypeScript

## Stack

- **Next.js 14** 
- **TypeScript**
- **Tailwind CSS** 
- **shadcn-style component structure** 
- **framer-motion** for all animations
- **lucide-react** for icons


The simulated analysis pipeline (log feed, attention curve, metrics) lives in `components/upload/analysis-stage.tsx`. Swap the `LOG_SCRIPT`, `ATTENTION_CURVE` constants and the `finishAnalysis()` call for the real fetch to the backend. 

## Current gaps

- No backend: the upload flow simulates analysis client side only.
- No real auth, storage, or persistence of uploaded videos.
- No SEO/OG image, sitemap, or analytics wired up yet.
