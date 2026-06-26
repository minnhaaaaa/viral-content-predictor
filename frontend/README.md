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


## Known gaps to fill in before shipping

- No backend: the upload flow simulates analysis client-side only.
- No real auth, storage, or persistence of uploaded videos.
- No SEO/OG image, sitemap, or analytics wired up yet.
