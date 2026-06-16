"use client";

import React from "react";
import { TextReveal, FadeReveal } from "@/components/ui/text-reveal";

const SIGNALS = [
  {
    num: "01",
    title: "Hook window",
    body: "The first 1–3 seconds are scored for novelty, motion, and faces — the exact triggers that decide whether a thumb keeps scrolling.",
  },
  {
    num: "02",
    title: "Pacing rhythm",
    body: "Cut frequency and shot length are mapped against arousal to find where pacing matches the emotional beat — and where it fights it.",
  },
  {
    num: "03",
    title: "Face & gaze",
    body: "Human faces and eye contact are some of the strongest attention magnets. XenrexAI tracks when they appear and when they disappear.",
  },
  {
    num: "04",
    title: "Emotional peaks",
    body: "Moments of surprise, tension, humour and reward are flagged — the spikes that make a viewer's brain want to keep watching.",
  },
  {
    num: "05",
    title: "Drop-off risk",
    body: "XenrexAI finds the seconds where attention is statistically likely to collapse — flat pacing, repeated beats, dead air.",
  },
  {
    num: "06",
    title: "Retention forecast",
    body: "All signals combine into a predicted average watch time and completion rate, benchmarked against your platform and format.",
  },
];

export function Signals() {
  return (
    <section
      id="signals"
      className="max-w-[1240px] mx-auto px-5 md:px-14 py-20 md:py-32 border-t border-white/[0.06]"
    >
      <div className="max-w-[640px] mb-14">
        <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-primary mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
          Signal library
        </p>
        <TextReveal
          as="h2"
          lines={["Every signal a brain", "responds to, quantified."]}
          className="font-display font-semibold text-[2rem] md:text-[3.4rem] leading-[1.1]"
        />
        <FadeReveal delay={0.15}>
          <p className="mt-5 text-muted-foreground text-base max-w-[40ch]">
            Not vanity metrics. The same signals neuroscientists use to study
            attention — applied to your cut, before an audience ever sees it.
          </p>
        </FadeReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-[18px] overflow-hidden">
        {SIGNALS.map((s, i) => (
          <FadeReveal
            key={s.num}
            delay={i * 0.08}
            className="bg-[#041830] px-7 py-8 transition-colors hover:bg-[#052240]"
          >
            <div className="font-mono text-xs text-primary tracking-wide mb-6">
              {s.num}
            </div>
            <h3 className="font-display text-[1.15rem] font-semibold mb-2.5">
              {s.title}
            </h3>
            <p className="text-muted-foreground text-sm">{s.body}</p>
          </FadeReveal>
        ))}
      </div>
    </section>
  );
}
