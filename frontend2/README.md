# XenrexAI — Next.js + shadcn + Tailwind + TypeScript

This is the React/Next.js migration of the XenrexAI marketing site.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom XenrexAI color tokens in `tailwind.config.js`)
- **shadcn-style component structure** (`components/ui/*`, `lib/utils.ts`, `components.json`)
- **framer-motion** for all animation (infinite grid, dropdowns, scroll reveals, the 3D scroll card)
- **lucide-react** for icons

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/
  layout.tsx        — root layout, fonts, metadata
  page.tsx           — assembles all sections
  globals.css         — Tailwind base + custom keyframes
components/
  site-header.tsx
  hero.tsx
  hero-readout.tsx
  how-it-reads.tsx
  signals.tsx
  cta-section.tsx
  site-footer.tsx
  upload/
    types.ts
    dropzone.tsx
    account-panel.tsx
    context-panel.tsx
    analysis-stage.tsx
    upload-section.tsx
  ui/
    infinite-grid.tsx           — mouse-reactive animated grid background
    fluid-dropdown.tsx           — animated custom select (no native <select>)
    container-scroll-animation.tsx — 3D scroll-tied card, used for "How it reads"
    text-reveal.tsx               — line-by-line scroll reveal + fade reveal
    button.tsx
    input.tsx                    — number inputs have spinner arrows removed
lib/
  utils.ts            — cn() helper (clsx + tailwind-merge)
public/
  logo.png            — your brain logo, used in header + hero
```

## Notes on this migration

- The **Infinite Grid** background, **Fluid Dropdown**, and **Container Scroll Animation**
  components you provided were adapted from their original demo form into the
  site's actual color system and content (XenrexAI signal/teal accent colors,
  no orange/blue blobs, dark navy palette).
- The "How it reads" section's 3D card now uses `#001d3d` as its background,
  per your request — defined directly in `container-scroll-animation.tsx` and
  also exposed as `xenrex.deep-blue` in the Tailwind config if you want to
  reuse it elsewhere.
- All number inputs (follower count, days since last upload, avg. views) have
  the native up/down spinner arrows removed via Tailwind's arbitrary-variant
  syntax in `components/ui/input.tsx`.
- Dropdown options are plain text — no emoji icons.
- The simulated analysis pipeline (log feed, attention curve, metrics) lives
  in `components/upload/analysis-stage.tsx`. Swap the `LOG_SCRIPT` /
  `ATTENTION_CURVE` constants and the `finishAnalysis()` call for a real
  fetch to your backend when ready.

## Known gaps to fill in before shipping

- No backend: the upload flow simulates analysis client-side only.
- No real auth, storage, or persistence of uploaded videos.
- No SEO/OG image, sitemap, or analytics wired up yet.
