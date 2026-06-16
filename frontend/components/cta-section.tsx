"use client";

import React from "react";
import Link from "next/link";
import { FadeReveal } from "@/components/ui/text-reveal";

export function CTASection() {
  return (
    <section className="max-w-[1240px] mx-auto px-5 md:px-14 py-24 md:py-40 text-center border-t border-white/[0.06]">
      <FadeReveal>
        <h2 className="font-display font-semibold text-[2rem] md:text-[3.4rem] leading-[1.1] mb-5">
          Stop guessing.
          <br />
          Start reading.
        </h2>
        <p className="text-muted-foreground text-base max-w-[40ch] mx-auto mb-10">
          Run your next edit through XenrexAI before you publish — and see
          your video the way your audience&apos;s brain will.
        </p>
        <Link
          href="#upload"
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-mono font-bold text-sm tracking-wide uppercase px-7 py-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.25)]"
        >
          Scan my video
        </Link>
      </FadeReveal>
    </section>
  );
}
