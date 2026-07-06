"use client";

import React from "react";
import { TextReveal, FadeReveal } from "@/components/ui/text-reveal";

const SIGNALS = [
  { num: "01", title: "Hook window",        body: "The first 1–3 seconds scored for novelty, motion, and faces — the exact triggers that decide whether a thumb keeps scrolling." },
  { num: "02", title: "Pacing rhythm",      body: "Cut frequency and shot length mapped against arousal to find where pacing matches the emotional beat — and where it fights it." },
  { num: "03", title: "Face & gaze",        body: "Human faces and eye contact are the strongest attention magnets. XenrexAI tracks when they appear and when they disappear." },
  { num: "04", title: "Emotional peaks",    body: "Moments of surprise, tension, humour and reward are flagged — the spikes that make a viewer's brain want to keep watching." },
  { num: "05", title: "Drop-off risk",      body: "XenrexAI finds the seconds where attention is likely to collapse — flat pacing, repeated beats, dead air." },
  { num: "06", title: "Retention forecast", body: "All signals combine into a predicted average watch time and completion rate, benchmarked against your platform and format." },
];

export function Signals() {
  return (
    <section id="signals" className="bg-white">
      <div className="max-w-page mx-auto px-6 md:px-14 py-20 md:py-32 border-t border-mist">
        <div className="max-w-[640px] mb-14">
          <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
            Signal library
          </p>
          <TextReveal
            as="h2"
            lines={["Every signal a brain", "responds to, quantified."]}
            className="font-display font-semibold text-[2rem] md:text-[3.4rem] leading-[1.1] text-ink"
          />
          <FadeReveal delay={0.15}>
            <p className="mt-5 text-stone text-base max-w-[40ch]">
              Not vanity metrics. The same signals neuroscientists use to study attention — applied to your cut, before an audience ever sees it.
            </p>
          </FadeReveal>
        </div>

        {/* DESIGN.MD Feature Card pattern: 20px radius, 40px 32px padding, navy-tinted shadow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SIGNALS.map((s, i) => (
            <FadeReveal key={s.num} delay={i * 0.07}
              className="bg-white rounded-[20px] transition-shadow duration-300 hover:shadow-card cursor-default"
              style={{ padding: "40px 32px", boxShadow: "rgba(0,53,102,0.10) 6px 4px 24px 0px" }}>
              <div className="font-mono text-xs text-primary tracking-wide mb-5">{s.num}</div>
              <h3 className="font-display text-lg font-semibold mb-2.5 text-ink">{s.title}</h3>
              <p className="text-stone text-sm leading-relaxed">{s.body}</p>
            </FadeReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
