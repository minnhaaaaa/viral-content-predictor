"use client";

import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { TextReveal } from "@/components/ui/text-reveal";

const PASSES = [
  {
    num: "01",
    title: "Visual cortex pass",
    body: "Every frame is read for motion, composition, faces, and cuts — the raw stimuli a viewer's eyes register before any thought forms.",
    visual: "scan-bars",
  },
  {
    num: "02",
    title: "Arousal mapping",
    body: "Tone, pacing, music and dialogue intensity are scored second-by-second to model the emotional charge a viewer carries through the edit.",
    visual: "arousal-wave",
  },
  {
    num: "03",
    title: "Attention modelling",
    body: "XenrexAI predicts where focus sharpens and where it drifts — flagging the exact second a typical viewer's mind starts to wander, and why.",
    visual: "model-curve",
  },
  {
    num: "04",
    title: "The verdict",
    body: "All passes fuse into one read: a hook score, engagement grade, retention forecast, and a plain-language note on what to recut before you publish.",
    visual: "verdict-badge",
  },
];

export function HowItReads() {
  return (
    <section id="how">
      <ContainerScroll
        titleComponent={
          <>
            <p className="inline-flex items-center justify-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-primary mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
              How XenrexAI reads
            </p>
            <TextReveal
              as="h2"
              lines={["Four passes.", "One mind, scanned."]}
              className="font-display font-semibold text-[2rem] md:text-[3.4rem] leading-[1.1]"
            />
          </>
        }
      >
        <div className="p-6 md:p-10 flex flex-col h-full">
          {PASSES.map((pass, i) => (
            <HowItem key={pass.num} pass={pass} index={i} />
          ))}
        </div>
      </ContainerScroll>
    </section>
  );
}

function HowItem({
  pass,
  index,
}: {
  pass: (typeof PASSES)[number];
  index: number;
}) {
  return (
    <article
      className={`grid grid-cols-1 md:grid-cols-[50px_1fr_200px] gap-3 md:gap-7 items-center py-5 md:py-6 ${
        index !== 0 ? "border-t border-white/[0.06]" : ""
      }`}
    >
      <div className="font-mono text-sm text-border tracking-wide">
        {pass.num}
      </div>
      <div>
        <h3 className="font-display text-base md:text-[1.15rem] font-semibold mb-1.5">
          {pass.title}
        </h3>
        <p className="text-muted-foreground text-sm max-w-[38ch]">
          {pass.body}
        </p>
      </div>
      <div className="hidden md:flex">
        <VisualFrame type={pass.visual} />
      </div>
    </article>
  );
}

function VisualFrame({ type }: { type: string }) {
  return (
    <div className="bg-primary/[0.04] border border-white/[0.08] rounded-[10px] h-20 w-full flex items-center justify-center overflow-hidden">
      {type === "scan-bars" && (
        <div className="flex items-end gap-[5px] h-[55%]">
          {[35, 70, 45, 90, 55, 75, 40, 65].map((h, i) => (
            <span
              key={i}
              className="w-[5px] bg-primary/70 rounded-sm animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "1.6s",
              }}
            />
          ))}
        </div>
      )}
      {type === "arousal-wave" && (
        <svg
          viewBox="0 0 200 80"
          preserveAspectRatio="none"
          className="w-[80%] h-[65%] overflow-visible"
        >
          <path
            d="M0,40 Q15,10 30,40 T60,40 T90,55 T120,15 T150,40 T180,40 T200,40"
            fill="none"
            stroke="#00d4c8"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
      {type === "model-curve" && (
        <svg
          viewBox="0 0 200 80"
          preserveAspectRatio="none"
          className="w-[85%] h-[70%] overflow-visible"
        >
          <path
            d="M0,20 C40,15 50,60 80,65 C110,68 120,30 160,25 C180,22 190,30 200,28"
            fill="none"
            stroke="#00d4c8"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="80" cy="65" r="3" fill="#ff6b47" />
          <text
            x="80"
            y="58"
            textAnchor="middle"
            className="fill-alert"
            style={{ fontSize: "7px", fontFamily: "Fragment Mono, monospace" }}
          >
            DROP
          </text>
        </svg>
      )}
      {type === "verdict-badge" && (
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-[2.2rem] font-bold text-primary leading-none">
            B+
          </span>
          <span className="font-mono text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground">
            predicted hold
          </span>
        </div>
      )}
    </div>
  );
}
