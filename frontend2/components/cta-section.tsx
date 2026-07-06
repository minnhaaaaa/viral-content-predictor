"use client";

import React from "react";
import Link from "next/link";
import { FadeReveal } from "@/components/ui/text-reveal";

export function CTASection() {
  return (
    <section className="bg-white">
      <div className="max-w-page mx-auto px-6 md:px-14 py-24 md:py-40 text-center border-t border-mist">
        <FadeReveal>
          <h2 className="font-display font-semibold text-[2rem] md:text-[3.4rem] leading-[1.1] mb-5 text-ink">
            Stop guessing.<br />Start reading.
          </h2>
          <p className="text-stone text-base max-w-[40ch] mx-auto mb-10">
            Run your next edit through XenrexAI before you publish — and see your video the way your audience&apos;s brain will.
          </p>
          <Link
            href="#upload"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-white text-[16px] font-semibold px-8 py-3.5 transition-all hover:bg-[#004a8f] hover:-translate-y-0.5 shadow-btn"
            style={{ letterSpacing: "0.015em" }}
          >
            Scan my video
          </Link>
        </FadeReveal>
      </div>
    </section>
  );
}
