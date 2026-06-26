"use client";

import React, { useRef, useEffect } from "react";
import { AnalysisResult } from "./result-types";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS (design.md adapted to dark navy)
   Orange → teal (#00d4c8), cream → dark navy (#020f1e)
   Cards: white/glass floating on navy. Radius: 20px. Padding: 32-40px.
──────────────────────────────────────────────────────────────── */

/* Card surface — white-ish glass floating on dark */
const CARD =
  "relative overflow-hidden rounded-[20px] bg-[#0a2540] border border-white/[0.08] " +
  "shadow-[rgba(0,0,0,0.35)_0px_4px_24px_0px] " +
  "transition-colors duration-300 hover:border-primary/25 hover:bg-[#0c2d4a]";

const CARD_H = "h-[220px]";
const CARD_PAD = "p-8"; // 32px = design.md card padding

/* ─────────────────────────────────────────────────────────────
   REVEAL — opacity only, no transforms, once-only via disconnect
──────────────────────────────────────────────────────────────── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      setTimeout(() => { if (el) el.style.opacity = "1"; }, delay * 1000 + 40);
    }, { threshold: 0.05, rootMargin: "0px 0px -30px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className} style={{ opacity: 0, transition: `opacity 0.65s ease ${delay}s` }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COUNT-UP — direct DOM write via rAF, triggered by IntersectionObserver
──────────────────────────────────────────────────────────────── */
function useCountUp(ref: React.RefObject<HTMLElement | null>, value: number, suffix = "", startDelay = 0) {
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = "—";
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      obs.disconnect();
      setTimeout(() => {
        const dur = 900, t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          const v = Math.round((1 - Math.pow(1 - p, 3)) * value);
          if (el) el.textContent = v + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, startDelay);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, value, suffix, startDelay]);
}

function CountSpan({ value, suffix = "", className = "", startDelay = 0 }: { value: number; suffix?: string; className?: string; startDelay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref as React.RefObject<HTMLElement>, value, suffix, startDelay);
  return <span ref={ref} className={className}>—</span>;
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED BAR — width CSS transition, triggered separately from card reveal
──────────────────────────────────────────────────────────────── */
function AnimatedBar({ value, color, startDelay = 0 }: { value: number; color: string; startDelay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      obs.disconnect();
      setTimeout(() => { if (el) el.style.width = `${value}%`; }, startDelay);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, startDelay]);
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.08)", marginBottom: 12 }}>
      <div
        ref={ref}
        style={{
          width: 0, height: "100%", borderRadius: 9999,
          background: color, boxShadow: `0 0 8px ${color}55`,
          transition: "width 1.1s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SVG PATH DRAW — stroke-dashoffset via IntersectionObserver
──────────────────────────────────────────────────────────────── */
function useSvgDraw(ref: React.RefObject<SVGPathElement | null>, fills: React.RefObject<SVGPathElement | null>[] = []) {
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      obs.disconnect();
      const len = el.getTotalLength?.() ?? 800;
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      requestAnimationFrame(() => {
        el.style.transition = "stroke-dashoffset 2s ease-in-out";
        el.style.strokeDashoffset = "0";
      });
      fills.forEach(f => {
        if (f.current) { f.current.style.transition = "opacity 0.8s ease 0.4s"; f.current.style.opacity = "1"; }
      });
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  });
}

/* ─────────────────────────────────────────────────────────────
   UI ATOMS
──────────────────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-primary mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      {children}
    </p>
  );
}
function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display font-semibold text-2xl md:text-3xl mb-8">{children}</h3>;
}

/* Card: design.md style — 20px radius, 32px padding, floating shadow */
function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={`${CARD} ${CARD_H} ${CARD_PAD} flex flex-col justify-between ${className}`}>
      {/* Inner gradient top sheen (design.md card glow) */}
      <div className="pointer-events-none absolute inset-0 rounded-[20px]"
        style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.03) 0%,transparent 45%)" }} />
      {children}
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────
   S1 — COMPOSITE SCORE
──────────────────────────────────────────────────────────────── */
function CompositeScore({ score }: { score: number }) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  // Isolated state for the ring — only this component re-renders
  const [ringVal, setRingVal] = React.useState(0);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      obs.disconnect();
      // 200ms delay so the Reveal opacity transition finishes first
      setTimeout(() => {
        const dur = 1400, t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          const v = Math.round((1 - Math.pow(1 - p, 3)) * score);
          if (numRef.current) numRef.current.textContent = String(v);
          setRingVal(v);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 200);
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [score]);

  const grade = score >= 90 ? "A" : score >= 80 ? "B+" : score >= 70 ? "B" : score >= 60 ? "C+" : "C";

  return (
    <Reveal className="py-20 border-b border-white/[0.06]">
      <div className="flex flex-col items-center text-center">
        <SectionLabel>Overall Composite Score</SectionLabel>
        <h2 className="font-display font-semibold text-3xl md:text-5xl mb-14">
          Your video&apos;s overall composite score
        </h2>

        <div ref={triggerRef} className="flex flex-col items-center gap-3 mb-12">
          <div className="relative w-52 h-52">
            <AnimatedCircularProgressBar
              value={ringVal} max={100} min={0}
              gaugePrimaryColor="#00d4c8"
              gaugeSecondaryColor="rgba(10,58,90,0.5)"
              className="w-52 h-52"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span ref={numRef} className="font-display font-extrabold leading-none"
                style={{ fontSize: "3.6rem", color: "#00d4c8", filter: "drop-shadow(0 0 14px rgba(0,212,200,0.45))" }}>
                0
              </span>
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1">/100</span>
            </div>
          </div>
          <span className="font-display font-bold text-4xl" style={{ color: "#00d4c8" }}>{grade}</span>
        </div>

        <div className="flex flex-col items-center gap-3 mb-10 w-full max-w-sm">
          {[
            { label: "Neural Visual", val: 88, good: true },
            { label: "Neural Audio", val: 79, good: true },
            { label: "Emotional Arc", val: 91, good: true },
            { label: "Platform Compliance", val: 52, good: false },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-4 w-full">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.good ? "bg-primary" : "bg-alert"}`} />
              <span className="font-mono text-xs text-muted-foreground flex-1 text-left">{s.label}</span>
              <span className={`font-display font-bold text-lg ${s.good ? "text-primary" : "text-alert"}`}>{s.val}</span>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground font-mono text-sm max-w-[48ch] leading-relaxed">
          Strong video with a clear emotional arc. Platform compliance is the main drag — fix that and this becomes a top&#8209;10% post.
        </p>
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────
   S2 — PLATFORM SCORES
──────────────────────────────────────────────────────────────── */
function PlatformScores({ scores }: { scores: AnalysisResult["platform_scores"] }) {
  const list = [
    { key: "tiktok" as const, label: "TikTok", desc: "Algorithmic short-form push" },
    { key: "reels" as const, label: "Instagram Reels", desc: "Discovery feed, visual-first" },
    { key: "shorts" as const, label: "YouTube Shorts", desc: "Subscriber + search hybrid" },
  ];
  return (
    <Reveal className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Platform Fit</SectionLabel>
      <SectionHeading>Where this video performs best</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {list.map(({ key, label, desc }, i) => {
          const val = scores[key];
          const col = val >= 80 ? "#00d4c8" : val >= 65 ? "#f59e0b" : "#ff6b47";
          return (
            <Card key={key} delay={i * 0.07}>
              <div>
                <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground block mb-1">{label}</span>
                <p className="font-mono text-xs" style={{ color: "#1a4060" }}>{desc}</p>
              </div>
              <div>
                <AnimatedBar value={val} color={col} startDelay={i * 70 + 350} />
                <div className="flex items-end gap-1.5">
                  <span style={{ color: col }}>
                    <CountSpan value={val} className="font-display font-extrabold text-5xl leading-none" startDelay={i * 70 + 350} />
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────
   S3 — HOOK SCORE
──────────────────────────────────────────────────────────────── */
function HookScore({ scores }: { scores: AnalysisResult["hook_score"] }) {
  const list = [
    { key: "tiktok" as const, label: "TikTok Hook" },
    { key: "reels" as const, label: "Reels Hook" },
    { key: "shorts" as const, label: "Shorts Hook" },
  ];
  return (
    <Reveal className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Hook Score</SectionLabel>
      <SectionHeading>Opening hook strength, per platform</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {list.map(({ key, label }, i) => {
          const val = scores[key];
          const col = val >= 85 ? "#00d4c8" : val >= 70 ? "#f59e0b" : "#ff6b47";
          return (
            <Card key={key} delay={i * 0.07}>
              <div>
                <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground block mb-1">{label}</span>
                <p className="font-mono text-xs" style={{ color: "#1a4060" }}>
                  {val >= 85 ? "Strong — thumb-stopping open" : val >= 70 ? "Decent — room to tighten" : "Weak — rethink the first cut"}
                </p>
              </div>
              <div>
                <AnimatedBar value={val} color={col} startDelay={i * 70 + 350} />
                <div className="flex items-end gap-1.5">
                  <CountSpan value={val} className="font-display font-extrabold text-5xl leading-none" startDelay={i * 70 + 350} />
                  <span className="font-mono text-sm text-muted-foreground mb-1">/100</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────
   S4 — ATTENTION CURVE
──────────────────────────────────────────────────────────────── */
function AttentionChart({ curve, drifts }: { curve: AnalysisResult["attention_curve"]; drifts: AnalysisResult["drift_timestamps"] }) {
  const lineRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  useSvgDraw(lineRef, [fillRef]);

  const W = 560, H = 140;
  const maxSec = curve[curve.length - 1].second;
  const toX = (s: number) => (s / maxSec) * W;
  const toY = (v: number) => H - (v / 100) * H;
  const linePath = curve.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.second).toFixed(1)},${toY(p.score).toFixed(1)}`).join(" ");
  const fillPath = `M0,${H} ${curve.map(p => `L${toX(p.second).toFixed(1)},${toY(p.score).toFixed(1)}`).join(" ")} L${W},${H} Z`;

  return (
    <Reveal className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Attention Curve</SectionLabel>
      <SectionHeading>Attention drop-off map</SectionHeading>
      <div className={`${CARD} p-5 mb-5 overflow-x-auto`} style={{ height: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full min-w-[320px]" style={{ height: 180 }}>
          {[25, 50, 75].map(v => <line key={v} x1={0} y1={toY(v)} x2={W} y2={toY(v)} stroke="#0a3a5a" strokeWidth="1" />)}
          <path ref={fillRef} d={fillPath} fill="rgba(0,212,200,0.07)" style={{ opacity: 0 }} />
          <path ref={lineRef} d={linePath} fill="none" stroke="#00d4c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(0,212,200,0.5))" }} />
          {drifts.map(d => {
            const nearest = curve.reduce((p, c) => Math.abs(c.second - d.time) < Math.abs(p.second - d.time) ? c : p).score;
            return (
              <g key={d.time}>
                <line x1={toX(d.time)} y1={0} x2={toX(d.time)} y2={H} stroke="#ff6b47" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
                <circle cx={toX(d.time)} cy={toY(nearest)} r="4" fill="#ff6b47" style={{ filter: "drop-shadow(0 0 5px #ff6b47)" }} />
              </g>
            );
          })}
          {curve.filter((_, i) => i % 4 === 0).map(p => (
            <text key={p.second} x={toX(p.second)} y={H + 16} textAnchor="middle" style={{ fill: "#1a4060", fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>{p.second}s</text>
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {drifts.map((d, i) => (
          <Card key={i} delay={i * 0.08} className="border-alert/20">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-alert/10 text-alert border border-alert/20 uppercase tracking-wider whitespace-nowrap">{d.severity}</span>
              <span className="font-mono text-primary text-sm font-bold">{d.time.toFixed(1)}s</span>
            </div>
            <div>
              <p className="font-display font-semibold text-sm mb-1.5">{d.cause}</p>
              <p className="text-muted-foreground text-xs font-mono leading-relaxed">→ {d.recommendation}</p>
            </div>
          </Card>
        ))}
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────
   S5 — EMOTIONAL ARC
──────────────────────────────────────────────────────────────── */
function EmotionalArcChart({ arc }: { arc: AnalysisResult["emotional_arc"] }) {
  const lineRef = useRef<SVGPathElement>(null);
  const fill1Ref = useRef<SVGPathElement>(null);
  const fill2Ref = useRef<SVGPathElement>(null);
  useSvgDraw(lineRef, [fill1Ref, fill2Ref]);

  const W = 560, H = 140, midY = H / 2;
  const maxSec = arc[arc.length - 1].second;
  const toX = (s: number) => (s / maxSec) * W;
  const toY = (v: number) => midY - v * (H / 2 - 10);
  const linePath = arc.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.second).toFixed(1)},${toY(p.valence).toFixed(1)}`).join(" ");

  return (
    <Reveal className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Emotional Arc</SectionLabel>
      <SectionHeading>Emotional tone, second by second</SectionHeading>
      <div className={`${CARD} p-5 overflow-x-auto`} style={{ height: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full min-w-[320px]" style={{ height: 180 }}>
          <line x1={0} y1={midY} x2={W} y2={midY} stroke="#0a3a5a" strokeWidth="1.5" />
          <text x={6} y={midY - 8} style={{ fill: "#1a4060", fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>+</text>
          <text x={6} y={midY + 16} style={{ fill: "#1a4060", fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>−</text>
          <path ref={fill1Ref} d={`M0,${midY} ${arc.map(p => `L${toX(p.second).toFixed(1)},${toY(Math.max(p.valence, 0)).toFixed(1)}`).join(" ")} L${W},${midY} Z`} fill="rgba(0,212,200,0.1)" style={{ opacity: 0 }} />
          <path ref={fill2Ref} d={`M0,${midY} ${arc.map(p => `L${toX(p.second).toFixed(1)},${toY(Math.min(p.valence, 0)).toFixed(1)}`).join(" ")} L${W},${midY} Z`} fill="rgba(255,107,71,0.1)" style={{ opacity: 0 }} />
          <path ref={lineRef} d={linePath} fill="none" stroke="#00d4c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 5px rgba(0,212,200,0.4))" }} />
          {arc.filter((_, i) => i % 4 === 0).map(p => (
            <text key={p.second} x={toX(p.second)} y={H + 16} textAnchor="middle" style={{ fill: "#1a4060", fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>{p.second}s</text>
          ))}
        </svg>
      </div>
      <p className="font-mono text-xs text-muted-foreground mt-3">
        Ideal arc: neutral/negative open → escalating positive → strong positive peak → maintained close.
      </p>
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────
   S6 — LAYER BREAKDOWN
──────────────────────────────────────────────────────────────── */
function LayerBreakdown({ scores }: { scores: AnalysisResult["layer_scores"] }) {
  const layers = [
    { key: "neural_visual" as const, label: "Neural Visual", desc: "Frame saliency, motion energy, face detection" },
    { key: "neural_audio" as const, label: "Neural Audio", desc: "BPM sync, voice prosody, spectral surprise" },
    { key: "emotional_arc" as const, label: "Emotional Arc", desc: "Valence trajectory & arc shape scoring" },
    { key: "platform_compliance" as const, label: "Platform Compliance", desc: "Hook window, format rules, caption timing" },
  ];
  return (
    <Reveal className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Layer Analysis</SectionLabel>
      <SectionHeading>Which dimension to fix</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {layers.map(({ key, label, desc }, i) => {
          const val = scores[key];
          const col = val >= 80 ? "#00d4c8" : val >= 60 ? "#f59e0b" : "#ff6b47";
          return (
            <Card key={key} delay={i * 0.07}>
              <div>
                <span className="font-display font-semibold text-base block mb-1">{label}</span>
                <p className="text-muted-foreground text-xs font-mono">{desc}</p>
              </div>
              <div>
                <AnimatedBar value={val} color={col} startDelay={i * 70 + 350} />
                <span style={{ color: col }}>
                  <CountSpan value={val} className="font-display font-extrabold text-5xl" startDelay={i * 70 + 350} />
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────
   S7 — DISTRIBUTION
──────────────────────────────────────────────────────────────── */
function Distribution({ data }: { data: AnalysisResult["distribution"] }) {
  const items = [
    { label: "Trend Alignment", score: data.trend_alignment, desc: "Your keywords are gaining momentum on Google Trends" },
    { label: "Account Health", score: data.account_health, desc: "Posting frequency and follower engagement look solid" },
    { label: "Posting Timing", score: data.posting_timing, desc: data.posting_time_recommendation },
  ];
  return (
    <Reveal className="py-16">
      <SectionLabel>Distribution</SectionLabel>
      <SectionHeading>Algorithm reach multiplier</SectionHeading>
      <p className="text-muted-foreground text-sm mb-8 font-mono -mt-4">
        Combined multiplier: <span className="text-primary font-bold text-base">×{data.multiplier}</span> on your organic reach.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map(({ label, score, desc }, i) => {
          const col = score >= 7 ? "#00d4c8" : score >= 5 ? "#f59e0b" : "#ff6b47";
          return (
            <Card key={label} delay={i * 0.07}>
              <div>
                <span className="font-display font-semibold text-base block mb-1">{label}</span>
                <p className="text-muted-foreground text-xs font-mono leading-relaxed">{desc}</p>
              </div>
              <div>
                <AnimatedBar value={score * 10} color={col} startDelay={i * 70 + 350} />
                <div className="flex items-end gap-1.5">
                  <CountSpan value={score} className="font-display font-extrabold text-5xl leading-none" startDelay={i * 70 + 350} />
                  <span className="font-mono text-sm text-muted-foreground mb-1">/10</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────────────────────────────
   MASTER DASHBOARD
──────────────────────────────────────────────────────────────── */
export function ResultsDashboard({ result, onRescan }: { result: AnalysisResult; onRescan: () => void }) {
  return (
    <div className="max-w-[900px] mx-auto w-full">
      <CompositeScore score={result.composite_score} />
      <PlatformScores scores={result.platform_scores} />
      <HookScore scores={result.hook_score} />
      <AttentionChart curve={result.attention_curve} drifts={result.drift_timestamps} />
      <EmotionalArcChart arc={result.emotional_arc} />
      <LayerBreakdown scores={result.layer_scores} />
      <Distribution data={result.distribution} />
      <Reveal className="py-16 flex items-center justify-center border-t border-white/[0.06]">
        <button type="button" onClick={onRescan}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-mono font-bold text-sm tracking-wide uppercase px-8 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.3)]">
          Scan another video
        </button>
      </Reveal>
    </div>
  );
}
