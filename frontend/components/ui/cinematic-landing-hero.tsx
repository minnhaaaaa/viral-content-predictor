"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const INJECTED_STYLES = `
  .xenrex-gsap-reveal { visibility: hidden; }

  .xenrex-film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.04; mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>');
  }

  .xenrex-bg-grid {
    background-size: 60px 60px;
    background-image:
      linear-gradient(to right, rgba(0,212,200,0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,212,200,0.06) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .xenrex-card {
    background: linear-gradient(145deg, #041830 0%, #020f1e 100%);
    box-shadow:
      0 40px 100px -20px rgba(0,0,0,0.9),
      inset 0 1px 2px rgba(0,212,200,0.1),
      inset 0 -2px 4px rgba(0,0,0,0.8);
    border: 1px solid rgba(0,212,200,0.08);
  }

  .xenrex-card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(600px circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(0,212,200,0.06) 0%, transparent 40%);
    mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .xenrex-text-glow {
    color: #00d4c8;
    text-shadow: 0 0 40px rgba(0,212,200,0.35), 0 2px 4px rgba(0,0,0,0.5);
  }
`;

export interface XenrexCinematicProps extends React.HTMLAttributes<HTMLDivElement> {
  tagline?: string;
  subTagline?: string;
}

export function XenrexCinematicSection({
  tagline = "Read minds.",
  subTagline = "Before they scroll away.",
  className,
  ...props
}: XenrexCinematicProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Mouse sheen on card
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        cardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        cardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // GSAP scroll timeline
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    import("gsap").then(({ gsap }) =>
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
          gsap.set(".xenrex-tag-line", { autoAlpha: 0, y: 60, scale: 0.88, filter: "blur(16px)" });
          gsap.set(".xenrex-sub-line", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
          gsap.set(".xenrex-main-card", { y: typeof window !== "undefined" ? window.innerHeight + 100 : 900, autoAlpha: 1 });
          gsap.set([".xenrex-card-content", ".xenrex-badge"], { autoAlpha: 0 });
          gsap.set(".xenrex-cta-block", { autoAlpha: 0, scale: 0.85, filter: "blur(20px)" });

          // Intro
          const intro = gsap.timeline({ delay: 0.2 });
          intro
            .to(".xenrex-tag-line", { duration: 1.6, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", ease: "expo.out" })
            .to(".xenrex-sub-line", { duration: 1.2, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=0.9");

          // Scroll
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "+=5000",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          });

          tl
            .to([".xenrex-hero-text", ".xenrex-bg-grid"], { scale: 1.12, filter: "blur(16px)", opacity: 0.15, duration: 2 }, 0)
            .to(".xenrex-main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
            .to(".xenrex-main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
            .fromTo(".xenrex-card-content", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: "expo.out", duration: 2 }, "-=0.8")
            .fromTo(".xenrex-badge", { y: 60, autoAlpha: 0, scale: 0.8 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.4)", duration: 1.5 }, "-=1.5")
            .to({}, { duration: 2 })
            .set(".xenrex-hero-text", { autoAlpha: 0 })
            .to(".xenrex-main-card", {
              width: "90vw", height: "85vh", borderRadius: "32px", ease: "expo.inOut", duration: 1.6,
            }, "pullback")
            .to(".xenrex-cta-block", { autoAlpha: 1, scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.6 }, "pullback")
            .to(".xenrex-main-card", { y: typeof window !== "undefined" ? -window.innerHeight - 200 : -1200, ease: "power3.in", duration: 1.4 });
        }, containerRef);

        cleanup = () => ctx.revert();
      })
    );

    return () => cleanup?.();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-screen h-screen overflow-hidden flex items-center justify-center bg-background",
        className
      )}
      style={{ perspective: "1400px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="xenrex-film-grain" aria-hidden="true" />
      <div className="xenrex-bg-grid absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />

      {/* Hero taglines */}
      <div className="xenrex-hero-text absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4">
        <h2 className="xenrex-tag-line xenrex-gsap-reveal font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight text-foreground mb-4">
          {tagline}
        </h2>
        <h2 className="xenrex-sub-line xenrex-gsap-reveal font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight xenrex-text-glow">
          {subTagline}
        </h2>
      </div>

      {/* CTA block (appears during card pullback) */}
      <div className="xenrex-cta-block absolute z-10 flex flex-col items-center justify-center text-center w-screen px-6 pointer-events-auto">
        <h2 className="font-display font-bold text-4xl md:text-6xl mb-5 tracking-tight text-foreground">
          Ready to scan your video?
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto font-light leading-relaxed">
          Drop your edit. XenrexAI reads it the way a neuroscientist would — before you ever publish.
        </p>
        <a
          href="#upload"
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-mono font-bold text-sm tracking-wide uppercase px-8 py-4 transition-all hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(0,212,200,0.3)]"
        >
          Scan my video
        </a>
      </div>

      {/* The card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1400px" }}>
        <div
          ref={cardRef}
          className="xenrex-main-card xenrex-card relative overflow-hidden flex items-center justify-center pointer-events-auto w-[90vw] h-[85vh] rounded-[32px]"
        >
          <div className="xenrex-card-sheen" aria-hidden="true" />

          <div className="xenrex-card-content relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center gap-12 px-8 md:px-16 py-12">
            {/* Left: key stats */}
            <div className="flex flex-col gap-6 flex-1 max-w-sm">
              <p className="font-mono text-xs tracking-[0.22em] uppercase text-primary">
                What XenrexAI reads
              </p>
              {[
                { num: "88", label: "Neural Visual score" },
                { num: "91", label: "Emotional Arc score" },
                { num: "×1.27", label: "Distribution multiplier" },
              ].map(item => (
                <div key={item.label} className="xenrex-badge flex items-center gap-4">
                  <span className="font-display font-extrabold text-4xl text-primary">{item.num}</span>
                  <span className="font-mono text-sm text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Right: description */}
            <div className="flex flex-col gap-5 flex-1 max-w-sm">
              <h3 className="xenrex-badge font-display font-bold text-2xl md:text-3xl text-foreground leading-tight">
                Frame by frame. Second by second. Every signal your brain responds to.
              </h3>
              <p className="xenrex-badge font-mono text-sm text-muted-foreground leading-relaxed">
                XenrexAI models attention, arousal, emotional arc, and platform compliance — giving you a concrete roadmap to fix your edit before it goes live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
