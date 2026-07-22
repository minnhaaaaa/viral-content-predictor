"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Replaces the old GSAP scroll-pinned "cinematic" section. That version
 * pinned this block in place with a fixed +=5000px scroll range, which
 * desynced every time content below it (the results dashboard) changed
 * the page's total height — producing the "scroll up and everything
 * glitches / mixes together" bug. This version uses a plain
 * IntersectionObserver fade-in, matching Resend's restrained motion
 * language: fade-and-slide, ~150-600ms ease-out, no scroll hijacking.
 */
function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, inView };
}

export function XenrexReadSection() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  const stats = [
    { num: "88", label: "Neural Visual score" },
    { num: "91", label: "Emotional Arc score" },
    { num: "×1.27", label: "Distribution multiplier" },
  ];

  return (
    <section
      ref={ref}
      className="relative w-full bg-black border-t border-graphite-hairline"
    >
      <div className="max-w-page mx-auto px-6 md:px-14 py-24 md:py-36">
        {/* Headline — Domaine-style hero serif, restrained */}
        <div className="mb-16 max-w-2xl">
          <h2
            className={`font-display text-heading-lg md:text-display leading-none tracking-tight text-white mb-3 transition-all duration-500 ease-out ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            Read minds.
          </h2>
          <h2
            className={`font-display text-heading-lg md:text-display leading-none tracking-tight text-iris-violet transition-all duration-500 ease-out delay-100 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            Before they scroll away.
          </h2>
        </div>

        {/* Section card — hairline border, no shadow, no fill color */}
        <div
          className={`rounded-card border border-graphite-hairline bg-black p-8 md:p-12 transition-all duration-500 ease-out delay-200 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-6">
              <p className="font-mono text-caption tracking-[0.18em] uppercase text-ash-gray">
                What XenrexAI reads
              </p>
              {stats.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 transition-all duration-500 ease-out ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <span className="font-mono text-heading-sm font-medium text-iris-violet">
                    {item.num}
                  </span>
                  <span className="font-body text-body-sm text-ash-gray">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-4 justify-center">
              <h3 className="font-heading text-subheading md:text-heading-sm font-medium text-white leading-snug">
                Frame by frame. Second by second. Every signal your brain responds to.
              </h3>
              <p className="font-body text-body-sm text-ash-gray leading-relaxed">
                XenrexAI models attention, arousal, emotional arc, and platform
                compliance — giving you a concrete roadmap to fix your edit
                before it goes live.
              </p>
              <Link
                href="#upload"
                className="inline-flex items-center gap-2 rounded-button border border-graphite-hairline px-4 py-3 mt-2 text-body-sm text-white transition-colors duration-150 ease-out hover:border-white w-fit"
              >
                Scan my video
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5H13M13 5L9 1M13 5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
