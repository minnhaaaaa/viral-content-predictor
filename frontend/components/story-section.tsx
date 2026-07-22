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
          c.style.transition = "opacity 0.6s cubic-bezier(0.16,1,0.3,1)";
          c.style.opacity = "1";
        }, i * 80 + 40);
      });
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full min-h-screen flex flex-col justify-center bg-black border-t border-graphite-hairline px-6 md:px-14"
    >
      <div className="max-w-page mx-auto w-full py-24">
        <p data-slide-child className="font-mono text-caption font-medium uppercase tracking-[0.2em] text-ash-gray mb-6">
          {label}
        </p>
        <h2
          data-slide-child
          className="font-heading font-normal leading-[1.05] tracking-tight text-white mb-8"
          style={{ fontSize: "clamp(2.5rem, 6vw, 56px)", letterSpacing: "-0.03em" }}
        >
          {heading}
        </h2>
        <p data-slide-child className="max-w-[52ch] font-body text-body md:text-subheading font-normal leading-relaxed text-ash-gray mb-10">
          {body}
        </p>
        {pills && (
          <div data-slide-child className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
            {pills.map(pill => (
              <div key={pill.label} className="rounded-card border border-graphite-hairline p-5">
                <p className="mb-2 font-mono text-caption font-medium uppercase tracking-wider text-iris-violet">
                  {pill.label}
                </p>
                <p className="text-body-sm leading-relaxed text-ash-gray">{pill.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StorySection() {
  const SLIDES: SlideProps[] = [
    {
      label: "01 — The problem",
      heading: "You publish and hope.",
      body: "Every creator hits publish without knowing how their audience's brain will actually respond. No data. No preview. Just guesswork — and a view count two days later.",
    },
    {
      label: "02 — The science",
      heading: "Brains are predictable.",
      body: "Neuroscientists have mapped how attention rises and collapses in response to motion, faces, pacing, and emotional arc. The signals are real. The patterns are measurable.",
      pills: [
        { label: "Visual Cortex", desc: "Frame saliency, luminance shock, motion energy — scored per frame." },
        { label: "Neural Audio",  desc: "BPM sync, voice prosody, spectral surprise index — per second." },
        { label: "Emotional Arc", desc: "Valence trajectory modelled to predict when viewers feel, then leave." },
      ],
    },
    {
      label: "03 — The product",
      heading: "XenrexAI reads it.",
      body: "Drop your edit. Within seconds you get an attention curve, a composite score, platform-specific hook grades, and a plain-English fix list — before you ever hit publish.",
      pills: [
        { label: "04 passes",   desc: "Visual → Audio → Attention model → Verdict." },
        { label: "7 signals",   desc: "Every metric a neuroscientist uses to study focus." },
        { label: "3 platforms", desc: "TikTok, Reels, and Shorts scored separately." },
      ],
    },
    {
      label: "04 — The result",
      heading: "Stop guessing.",
      body: "Creators who scan before publishing fix the drop-off points that kill retention. The edit at 40% completion becomes 64%. The difference is knowing where to look.",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {SLIDES.map(slide => <StorySlide key={slide.label} {...slide} />)}
    </div>
  );
}
