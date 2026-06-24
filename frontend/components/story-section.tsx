"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "framer-motion";

/* ─── One slide ─────────────────────────────────────────────── */
interface SlideProps {
  label: string;
  heading: string;
  body: string;
  pills?: { label: string; desc: string }[];
  bgColor: string;
  textColor?: string;
  accentColor?: string;
  index: number;
}

function StorySlide({
  label,
  heading,
  body,
  pills,
  bgColor,
  textColor = "#e8f4f8",
  accentColor = "#00d4c8",
  index,
}: SlideProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.35 });

  return (
    <motion.div
      ref={ref}
      className="relative w-full min-h-screen flex flex-col justify-between px-[6vw] py-[clamp(3rem,8vw,5rem)]"
      style={{ backgroundColor: bgColor, color: textColor }}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
    >
      {/* Step label */}
      <motion.p
        className="font-mono text-xs font-bold uppercase tracking-[0.22em]"
        style={{ color: accentColor }}
        initial={{ opacity: 0, x: -16 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        {label}
      </motion.p>

      <div
        className="absolute left-0 right-0"
        style={{
          top: "calc(clamp(3rem,8vw,5rem) + 2rem)",
          bottom: "calc(clamp(3rem,8vw,5rem) + 2rem)",
          borderTop: `1px solid ${textColor}18`,
          borderBottom: `1px solid ${textColor}18`,
          pointerEvents: "none",
        }}
      />

      {/* Heading */}
      <motion.h2
        className="font-display font-bold leading-[0.88] uppercase tracking-tight"
        style={{ fontSize: "clamp(3rem,10vw,11rem)" }}
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        {heading}
      </motion.h2>

      {/* Body + pills */}
      <div className="flex flex-col gap-6">
        <motion.p
          className="max-w-[50ch] font-light leading-relaxed"
          style={{
            fontSize: "clamp(1rem,2.2vw,1.5rem)",
            color: `${textColor}bb`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        >
          {body}
        </motion.p>

        {pills && pills.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-[3vw]"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          >
            {pills.map((pill) => (
              <div key={pill.label} className="min-w-[160px] flex-1">
                <p
                  className="mb-1.5 text-sm font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}
                >
                  {pill.label}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${textColor}80` }}
                >
                  {pill.desc}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Section divider line ──────────────────────────────────── */
function Divider({ color = "rgba(255,255,255,0.08)" }: { color?: string }) {
  return <div style={{ width: "100%", height: "1px", background: color }} />;
}

/* ─── Master story section ──────────────────────────────────── */
export function StorySection() {
  const SLIDES: SlideProps[] = [
    {
      index: 0,
      label: "01 — The problem",
      heading: "You publish\nand hope.",
      body: "Every creator hits publish without knowing how their audience's brain will actually respond. No data. No preview. Just guesswork — and a view count two days later.",
      bgColor: "#020f1e",
    },
    {
      index: 1,
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
      index: 2,
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
      index: 3,
      label: "04 — The result",
      heading: "Stop\nguessing.",
      body: "Creators who scan before publishing fix the drop-off points that kill retention. The edit that would have performed at 40% completion becomes 64%. The difference is knowing where to look.",
      bgColor: "#026879",
      textColor: "#e8f4f8",
      accentColor: "#020f1e",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {SLIDES.map((slide, i) => (
        <React.Fragment key={slide.label}>
          <StorySlide {...slide} />
          {i < SLIDES.length - 1 && (
            <Divider color={i === 2 ? "rgba(0,212,200,0.15)" : "rgba(255,255,255,0.06)"} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
