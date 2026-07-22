"use client";

import React from "react";
import Link from "next/link";
import { FadeReveal } from "@/components/ui/text-reveal";

export function CTASection() {
  return (
    <section className="bg-black">
      <div className="max-w-page mx-auto px-6 md:px-14 py-24 md:py-40 text-center border-t border-graphite-hairline">
        <FadeReveal>
          <h2 className="font-heading font-normal text-[2rem] md:text-heading leading-[1.1] tracking-tight mb-5 text-white">
            Stop guessing.<br />Start reading.
          </h2>
          <p className="text-ash-gray text-body max-w-[40ch] mx-auto mb-10">
            Run your next edit through XenrexAI before you publish — and see your video the way your audience&apos;s brain will.
          </p>
          {/* Only filled-color action on the page: Signal Blue, per Resend's
              spec ("filled action" is the sole exception to ghost buttons) */}
          <Link
            href="#upload"
            className="inline-flex items-center gap-2 rounded-button bg-signal-blue text-black font-body font-medium text-body-sm px-6 py-3 transition-colors duration-150 ease-out hover:bg-sky-blue"
          >
            Scan my video
          </Link>
        </FadeReveal>
      </div>
    </section>
  );
}
