"use client";

import React, { useRef, useEffect } from "react";

interface SlideProps {
  label: string;
  heading: string;
  body: string;
  pills?: { label: string; desc: string }[];
}

function StorySlide({ label, heading, body, pills }: SlideProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = el.querySelectorAll<HTMLElement>("[data-slide-child]");
    children.forEach(c => { c.style.opacity = "0"; c.style.transition = "none"; });
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      children.forEach((c, i) => {
        setTimeout(() => {
          c.style.transition = "opacity 0.7s cubic-bezier(0.16,1,0.3,1)";
          c.style.opacity = "1";
        }, i * 90 + 60);
      });
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full min-h-screen flex flex-col justify-between bg-white px-[6vw] py-[clamp(3rem,8vw,5rem)]">
      <p data-slide-child className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-primary">{label}</p>
      <div data-slide-child className="w-full h-px bg-mist" style={{ margin: "clamp(1rem,3vw,2rem) 0" }} />
      <h2 data-slide-child className="font-display font-bold leading-[0.88] uppercase tracking-tight text-ink"
        style={{ fontSize: "clamp(3rem,10vw,11rem)" }}>
        {heading}
      </h2>
      <div data-slide-child className="w-full h-px bg-mist" style={{ margin: "clamp(1rem,3vw,2rem) 0" }} />
      <p data-slide-child className="max-w-[50ch] font-light leading-relaxed text-stone"
        style={{ fontSize: "clamp(1rem,2.2vw,1.5rem)" }}>
        {body}
      </p>
      {pills && (
        <div data-slide-child className="flex flex-wrap gap-[3vw] mt-[clamp(1rem,3vw,2rem)]">
          {pills.map(pill => (
            <div key={pill.label} className="min-w-[160px] flex-1">
              <p className="mb-1.5 text-sm font-bold uppercase tracking-wider text-primary">{pill.label}</p>
              <p className="text-sm leading-relaxed text-driftwood">{pill.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StorySection() {
  const SLIDES: SlideProps[] = [
    {
      label: "01 — The problem",
      heading: "You publish\nand hope.",
      body: "Every creator hits publish without knowing how their audience's brain will actually respond. No data. No preview. Just guesswork — and a view count two days later.",
    },
    {
      label: "02 — The science",
      heading: "Brains are\npredictable.",
      body: "Neuroscientists have mapped how attention rises and collapses in response to motion, faces, pacing, and emotional arc. The signals are real. The patterns are measurable.",
      pills: [
        { label: "Visual Cortex", desc: "Frame saliency, luminance shock, motion energy — scored per frame." },
        { label: "Neural Audio",  desc: "BPM sync, voice prosody, spectral surprise index — per second." },
        { label: "Emotional Arc", desc: "Valence trajectory modelled to predict when viewers feel, then leave." },
      ],
    },
    {
      label: "03 — The product",
      heading: "XenrexAI\nreads it.",
      body: "Drop your edit. Within seconds you get an attention curve, a composite score, platform-specific hook grades, and a plain-English fix list — before you ever hit publish.",
      pills: [
        { label: "04 passes",   desc: "Visual → Audio → Attention model → Verdict." },
        { label: "7 signals",   desc: "Every metric a neuroscientist uses to study focus." },
        { label: "3 platforms", desc: "TikTok, Reels, and Shorts scored separately." },
      ],
    },
    {
      label: "04 — The result",
      heading: "Stop\nguessing.",
      body: "Creators who scan before publishing fix the drop-off points that kill retention. The edit at 40% completion becomes 64%. The difference is knowing where to look.",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {SLIDES.map(slide => <StorySlide key={slide.label} {...slide} />)}
    </div>
  );
}
