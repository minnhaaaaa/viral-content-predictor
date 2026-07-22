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
    <section id="signals" className="bg-black">
      <div className="max-w-page mx-auto px-6 md:px-14 py-24 md:py-32 border-t border-graphite-hairline">
        <div className="max-w-[640px] mb-14">
          <p className="inline-flex items-center gap-2 font-mono text-caption tracking-[0.18em] uppercase text-ash-gray mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-iris-violet animate-pulse-dot" />
            Signal library
          </p>
          <TextReveal
            as="h2"
            lines={["Every signal a brain", "responds to, quantified."]}
            className="font-heading font-normal text-[2rem] md:text-heading leading-[1.1] tracking-tight text-white"
          />
          <FadeReveal delay={0.15}>
            <p className="mt-5 text-ash-gray text-body max-w-[40ch]">
              Not vanity metrics. The same signals neuroscientists use to study attention — applied to your cut, before an audience ever sees it.
            </p>
          </FadeReveal>
        </div>

        {/* Resend Section Card pattern — black bg, hairline border, no shadow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-graphite-hairline border border-graphite-hairline rounded-card overflow-hidden">
          {SIGNALS.map((s, i) => (
            <FadeReveal key={s.num} delay={i * 0.06}
              className="bg-black px-8 py-8 transition-colors duration-150 ease-out hover:bg-[#0b0e14] cursor-default">
              <div className="font-mono text-caption text-iris-violet tracking-wide mb-5">{s.num}</div>
              <h3 className="font-heading text-heading-sm font-medium mb-2.5 text-white">{s.title}</h3>
              <p className="text-ash-gray text-body-sm leading-relaxed">{s.body}</p>
            </FadeReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
