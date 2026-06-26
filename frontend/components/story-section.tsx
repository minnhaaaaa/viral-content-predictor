"use client";

import React, { useRef, useEffect } from "react";

interface SlideProps {
  label: string;
  heading: string;
  body: string;
  pills?: { label: string; desc: string }[];
  bgColor: string;
  textColor?: string;
  accentColor?: string;
}

function StorySlide({ label, heading, body, pills, bgColor, textColor = "#e8f4f8", accentColor = "#00d4c8" }: SlideProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Children animate in with staggered CSS transitions — opacity only, no transform
    const children = el.querySelectorAll<HTMLElement>("[data-slide-child]");
    children.forEach(c => { c.style.opacity = "0"; c.style.transition = "none"; });

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      children.forEach((c, i) => {
        // Use setTimeout so transitions apply after opacity:0 is painted
        setTimeout(() => {
          c.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1)`;
          c.style.opacity = "1";
        }, i * 90 + 60);
      });
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full min-h-screen flex flex-col justify-between px-[6vw] py-[clamp(3rem,8vw,5rem)]"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <p data-slide-child className="font-mono text-xs font-bold uppercase tracking-[0.22em]" style={{ color: accentColor }}>
        {label}
      </p>
      <div
        data-slide-child
        className="w-full"
        style={{ height: "1px", background: `${textColor}14`, margin: "clamp(1rem,3vw,2rem) 0" }}
      />
      <h2
        data-slide-child
        className="font-display font-bold leading-[0.88] uppercase tracking-tight"
        style={{ fontSize: "clamp(3rem,10vw,11rem)" }}
      >
        {heading}
      </h2>
      <div
        data-slide-child
        className="w-full"
        style={{ height: "1px", background: `${textColor}14`, margin: "clamp(1rem,3vw,2rem) 0" }}
      />
      <p
        data-slide-child
        className="max-w-[50ch] font-light leading-relaxed"
        style={{ fontSize: "clamp(1rem,2.2vw,1.5rem)", color: `${textColor}bb` }}
      >
        {body}
      </p>
      {pills && (
        <div data-slide-child className="flex flex-wrap gap-[3vw] mt-[clamp(1rem,3vw,2rem)]">
          {pills.map(pill => (
            <div key={pill.label} className="min-w-[160px] flex-1">
              <p className="mb-1.5 text-sm font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                {pill.label}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: `${textColor}70` }}>
                {pill.desc}
              </p>
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
      bgColor: "#020f1e",
    },
    {
      label: "02 — The science",
      heading: "Brains are\npredictable.",
      body: "Neuroscientists have mapped how attention rises and collapses in response to motion, faces, pacing, and emotional arc. The signals are real. The patterns are measurable.",
      bgColor: "#041830",
      pills: [
        { label: "Visual Cortex", desc: "Frame saliency, luminance shock, motion energy — scored per frame." },
        { label: "Neural Audio", desc: "BPM sync, voice prosody, spectral surprise index — per second." },
        { label: "Emotional Arc", desc: "Valence trajectory modelled to predict when viewers feel, then leave." },
      ],
    },
    {
      label: "03 — The product",
      heading: "XenrexAI\nreads it.",
      body: "Drop your edit. Within seconds you get an attention curve, a composite score, platform-specific hook grades, and a plain-English fix list — before you ever hit publish.",
      bgColor: "#052240",
      pills: [
        { label: "04 passes", desc: "Visual → Audio → Attention model → Verdict." },
        { label: "7 signals", desc: "Every metric a neuroscientist uses to study focus." },
        { label: "3 platforms", desc: "TikTok, Reels, and Shorts scored separately." },
      ],
    },
    {
      label: "04 — The result",
      heading: "Stop\nguessing.",
      body: "Creators who scan before publishing fix the drop-off points that kill retention. The edit that would have performed at 40% completion becomes 64%. The difference is knowing where to look.",
      bgColor: "#026879",
      textColor: "#e8f4f8",
      accentColor: "#e8f4f8",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {SLIDES.map((slide, i) => (
        <StorySlide key={slide.label} {...slide} />
      ))}
    </div>
  );
}
