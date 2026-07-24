"use client";

import React, { useRef, useEffect } from "react";
import { AnalysisResult } from "./result-types";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

/* ─────────────────────────────────────────────────────────────
   XenrexAI Results Dashboard — Resend "black velvet, violet neon"
   Canvas:  #000000  (void black — page and card surfaces alike)
   Cards:   #000000 + 1px #292d30 hairline border (Section Card pattern)
   Text:    #ffffff primary / #a1a4a5 secondary / #6e727a tertiary
   Accent:  #9281f7 Iris Violet — reserved for data identifiers only
            (scores, code-like labels) — never a filled button surface
   Signal:  #3b9eff Signal Blue — the one filled-button color
   Alert:   #ff9592 Alarm Red   — drift markers, warnings only
──────────────────────────────────────────────────────────────── */

const CARD =
  "relative overflow-hidden rounded-card bg-black border border-graphite-hairline " +
  "shadow-card transition-shadow duration-150 ease-out hover:shadow-card-hover";

/* ─── MARKDOWN-BOLD PARSER ────────────────────────────────────────
   The backend's LLM-generated fields (ai_summary, hook_iterations)
   sometimes include literal markdown bold syntax like **Emotional Arc**.
   Since these are rendered as plain JSX text, "**" was showing up
   literally instead of turning bold. This splits on **...** pairs and
   renders the wrapped portions as <strong>, leaving everything else as
   plain text — works regardless of whether the backend sends markdown
   or plain prose, so it's safe either way. */
function renderMarkdownBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

const CARD_H = "h-[220px]";
const CARD_PAD = "p-8";

/* ─── REVEAL — opacity only, once-only via disconnect ───────── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      setTimeout(() => { if (el) el.style.opacity = "1"; }, delay * 1000 + 40);
    }, { threshold: 0.01 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={className} style={{ opacity: 0, transition: `opacity 0.65s ease ${delay}s` }}>
      {children}
    </div>
  );
}

/* ─── COUNT-UP ────────────────────────────────────────────────── */
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

/* ─── ANIMATED BAR — sky blue by default, coral when flagged low ─ */
function AnimatedBar({ value, startDelay = 0, tone = "primary" }: { value: number; startDelay?: number; tone?: "primary" | "alert" }) {
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
    <div className="w-full rounded-full overflow-hidden bg-[#292d30]" style={{ height: 4, marginBottom: 12 }}>
      <div ref={ref} className={tone === "alert" ? "bg-[#ff9592]" : "bg-[#9281f7]"} style={{ width: 0, height: "100%", borderRadius: 9999, transition: "width 1.1s cubic-bezier(0.16,1,0.3,1)" }} />
    </div>
  );
}

/* ─── SVG PATH DRAW ───────────────────────────────────────────── */
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
      fills.forEach(f => { if (f.current) { f.current.style.transition = "opacity 0.8s ease 0.4s"; f.current.style.opacity = "1"; } });
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  });
}

/* ─── UI ATOMS ────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-[#9281f7] mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-[#9281f7] animate-pulse-dot" />
      {children}
    </p>
  );
}
function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display font-semibold text-2xl md:text-3xl mb-8 text-[#ffffff]">{children}</h3>;
}
function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={`${CARD} ${CARD_H} ${CARD_PAD} flex flex-col justify-between ${className}`}>
      {children}
    </Reveal>
  );
}

/* ─── S1 — COMPOSITE SCORE ────────────────────────────────────── */
function CompositeScore({ score, layerScores }: { score: number; layerScores: AnalysisResult["layer_scores"] }) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  const [ringVal, setRingVal] = React.useState(0);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      obs.disconnect();
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

  // Same four layers shown in full detail further down in Layer Analysis —
  // this quick-stat list used to be hardcoded mock numbers (88/79/91/52)
  // that never matched the real per-video scores, which is what produced
  // the inconsistency between this section and Layer Analysis below.
  const quickStats: { label: string; val: number }[] = [
    { label: "Neural Visual",       val: layerScores.neural_visual },
    { label: "Neural Audio",        val: layerScores.neural_audio },
    { label: "Emotional Arc",       val: layerScores.emotional_arc },
    { label: "Platform Compliance", val: layerScores.platform_compliance },
  ];

  return (
    <Reveal className="py-20 border-b border-[#292d30]">
      <div className="flex flex-col items-center text-center">
        <SectionLabel>Overall Composite Score</SectionLabel>
        <h2 className="font-display font-semibold text-3xl md:text-5xl mb-14 text-[#ffffff]">
          Your video&apos;s overall composite score
        </h2>

        <div ref={triggerRef} className="flex flex-col items-center gap-3 mb-12">
          <div className="relative w-52 h-52">
            <AnimatedCircularProgressBar
              value={ringVal} max={100} min={0}
              gaugePrimaryColor="#9281f7"
              gaugeSecondaryColor="#292d30"
              className="w-52 h-52"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span ref={numRef} className="font-display font-extrabold leading-none" style={{ fontSize: "3.6rem", color: "#9281f7" }}>0</span>
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#464a4d] mt-1">/100</span>
            </div>
          </div>
          <span className="font-display font-bold text-4xl text-[#9281f7]">{grade}</span>
        </div>

        <div className="flex flex-col items-center gap-3 mb-10 w-full max-w-sm">
          {quickStats.map(s => {
            const good = s.val >= 60;
            return (
              <div key={s.label} className="flex items-center gap-4 w-full">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${good ? "bg-[#9281f7]" : "bg-[#ff9592]"}`} />
                <span className="font-mono text-xs text-[#a1a4a5] flex-1 text-left">{s.label}</span>
                <span className={`font-display font-bold text-lg ${good ? "text-[#9281f7]" : "text-[#ff9592]"}`}>{s.val}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

/* ─── S2 — AI SUMMARY ─────────────────────────────────────────── */
function AiSummary({ text }: { text: string }) {
  if (!text) return null;

  return (
    <Reveal className="py-16 border-b border-[#292d30]">
      <SectionLabel>AI Summary</SectionLabel>
      <SectionHeading>What the model actually thinks</SectionHeading>
      <div className={`${CARD}`} style={{ height: "auto", padding: "32px" }}>
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(146,129,247,0.12)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9281f7" strokeWidth="1.8">
              <path d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 21 L12 16.5 L6.5 21 L8.5 13.5 L3 9 L10 9 Z" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="font-mono text-sm leading-relaxed text-[#ffffff]/90">
            {renderMarkdownBold(text)}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── S3 — HOOK ITERATIONS ────────────────────────────────────── */
function HookIterations({ items }: { items: { strategy: string; suggestion: string }[] }) {
  if (!items || items.length === 0) return null;

  return (
    <Reveal className="py-16 border-b border-[#292d30]">
      <SectionLabel>Hook Iterations</SectionLabel>
      <SectionHeading>Alternative ways to open this video</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <Card key={item.strategy} delay={i * 0.08} className="h-auto">
            <div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-3" style={{ background: "rgba(146,129,247,0.14)", color: "#9281f7" }}>
                {renderMarkdownBold(item.strategy)}
              </span>
              <p className="text-[#ffffff]/85 text-sm font-body leading-relaxed">{renderMarkdownBold(item.suggestion)}</p>
            </div>
          </Card>
        ))}
      </div>
    </Reveal>
  );
}

/* ─── S4 — PLATFORM SCORES ────────────────────────────────────── */
function PlatformScores({ scores }: { scores: AnalysisResult["platform_scores"] }) {
  const list = [
    { key: "tiktok" as const, label: "TikTok",          desc: "Algorithmic short-form push" },
    { key: "reels" as const,  label: "Instagram Reels", desc: "Discovery feed, visual-first" },
    { key: "shorts" as const, label: "YouTube Shorts",  desc: "Subscriber + search hybrid" },
  ];
  return (
    <Reveal className="py-16 border-b border-[#292d30]">
      <SectionLabel>Platform Fit</SectionLabel>
      <SectionHeading>Where this video performs best</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {list.map(({ key, label, desc }, i) => {
          const val = scores[key];
          const isLow = val < 65;
          return (
            <Card key={key} delay={i * 0.07}>
              <div>
                <span className="font-mono text-xs tracking-widest uppercase text-[#a1a4a5] block mb-1">{label}</span>
                <p className="font-mono text-xs text-[#464a4d]">{desc}</p>
              </div>
              <div>
                <AnimatedBar value={val} startDelay={i * 70 + 350} tone={isLow ? "alert" : "primary"} />
                <CountSpan value={val} className={`font-display font-extrabold text-5xl leading-none ${isLow ? "text-[#ff9592]" : "text-[#9281f7]"}`} startDelay={i * 70 + 350} />
              </div>
            </Card>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ─── S5 — HOOK SCORE ─────────────────────────────────────────── */
function HookScore({ scores }: { scores: AnalysisResult["hook_score"] }) {
  const list = [
    { key: "tiktok" as const, label: "TikTok Hook" },
    { key: "reels" as const,  label: "Reels Hook" },
    { key: "shorts" as const, label: "Shorts Hook" },
  ];
  return (
    <Reveal className="py-16 border-b border-[#292d30]">
      <SectionLabel>Hook Score</SectionLabel>
      <SectionHeading>Opening hook strength, per platform</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {list.map(({ key, label }, i) => {
          const val = scores[key];
          const isLow = val < 70;
          return (
            <Card key={key} delay={i * 0.07}>
              <div>
                <span className="font-mono text-xs tracking-widest uppercase text-[#a1a4a5] block mb-1">{label}</span>
                <p className="font-mono text-xs text-[#464a4d]">
                  {val >= 85 ? "Strong — thumb-stopping open" : val >= 70 ? "Decent — room to tighten" : "Weak — rethink the first cut"}
                </p>
              </div>
              <div>
                <AnimatedBar value={val} startDelay={i * 70 + 350} tone={isLow ? "alert" : "primary"} />
                <div className="flex items-end gap-1.5">
                  <CountSpan value={val} className={`font-display font-extrabold text-5xl leading-none ${isLow ? "text-[#ff9592]" : "text-[#9281f7]"}`} startDelay={i * 70 + 350} />
                  <span className="font-mono text-sm text-[#464a4d] mb-1">/100</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ─── S6 — ATTENTION CURVE — blue line, coral drift markers ──── */
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
    <Reveal className="py-16 border-b border-[#292d30]">
      <SectionLabel>Attention Curve</SectionLabel>
      <SectionHeading>Attention drop-off map</SectionHeading>
      <div className="rounded-card border border-graphite-hairline p-5 mb-5 overflow-x-auto bg-black shadow-card">
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full min-w-[320px]" style={{ height: 180 }}>
          {[25, 50, 75].map(v => <line key={v} x1={0} y1={toY(v)} x2={W} y2={toY(v)} stroke="#292d30" strokeWidth="1" />)}
          <path ref={fillRef} d={fillPath} fill="rgba(146,129,247,0.1)" style={{ opacity: 0 }} />
          <path ref={lineRef} d={linePath} fill="none" stroke="#9281f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {drifts.map(d => {
            const nearest = curve.reduce((p, c) => Math.abs(c.second - d.time) < Math.abs(p.second - d.time) ? c : p).score;
            return (
              <g key={d.time}>
                <line x1={toX(d.time)} y1={0} x2={toX(d.time)} y2={H} stroke="#ff9592" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
                <circle cx={toX(d.time)} cy={toY(nearest)} r="4" fill="#ff9592" />
              </g>
            );
          })}
          {curve.filter((_, i) => i % 4 === 0).map(p => (
            <text key={p.second} x={toX(p.second)} y={H + 16} textAnchor="middle" style={{ fill: "#464a4d", fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>{p.second}s</text>
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {drifts.map((d, i) => (
          <Card key={i} delay={i * 0.08}>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap" style={{ background: "rgba(255,149,146,0.15)", color: "#ff9592" }}>{d.severity}</span>
              <span className="font-mono text-[#ff9592] text-sm font-bold">{d.time.toFixed(1)}s</span>
            </div>
            <div>
              <p className="font-display font-semibold text-sm mb-1.5 text-[#ffffff]">{d.cause}</p>
              <p className="text-[#a1a4a5] text-xs font-mono leading-relaxed">→ {d.recommendation}</p>
            </div>
          </Card>
        ))}
      </div>
    </Reveal>
  );
}

/* ─── S7 — EMOTIONAL ARC — blue positive / coral negative ────── */
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
    <Reveal className="py-16 border-b border-[#292d30]">
      <SectionLabel>Emotional Arc</SectionLabel>
      <SectionHeading>Emotional tone, second by second</SectionHeading>
      <div className="rounded-card border border-graphite-hairline p-5 overflow-x-auto bg-black shadow-card">
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full min-w-[320px]" style={{ height: 180 }}>
          <line x1={0} y1={midY} x2={W} y2={midY} stroke="#292d30" strokeWidth="1.5" />
          <text x={6} y={midY - 8} style={{ fill: "#a1a4a5", fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>+</text>
          <text x={6} y={midY + 16} style={{ fill: "#a1a4a5", fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>−</text>
          <path ref={fill1Ref} d={`M0,${midY} ${arc.map(p => `L${toX(p.second).toFixed(1)},${toY(Math.max(p.valence, 0)).toFixed(1)}`).join(" ")} L${W},${midY} Z`} fill="rgba(146,129,247,0.14)" style={{ opacity: 0 }} />
          <path ref={fill2Ref} d={`M0,${midY} ${arc.map(p => `L${toX(p.second).toFixed(1)},${toY(Math.min(p.valence, 0)).toFixed(1)}`).join(" ")} L${W},${midY} Z`} fill="rgba(255,149,146,0.14)" style={{ opacity: 0 }} />
          <path ref={lineRef} d={linePath} fill="none" stroke="#9281f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {arc.filter((_, i) => i % 4 === 0).map(p => (
            <text key={p.second} x={toX(p.second)} y={H + 16} textAnchor="middle" style={{ fill: "#464a4d", fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>{p.second}s</text>
          ))}
        </svg>
      </div>
      <p className="font-mono text-xs text-[#a1a4a5] mt-3">
        Ideal arc: neutral/negative open → escalating positive → strong positive peak → maintained close.
      </p>
    </Reveal>
  );
}

/* ─── S8 — LAYER BREAKDOWN ────────────────────────────────────── */
function LayerBreakdown({ scores }: { scores: AnalysisResult["layer_scores"] }) {
  const layers = [
    { key: "neural_visual" as const,       label: "Neural Visual",       desc: "Frame saliency, motion energy, face detection" },
    { key: "neural_audio" as const,        label: "Neural Audio",        desc: "BPM sync, voice prosody, spectral surprise" },
    { key: "emotional_arc" as const,       label: "Emotional Arc",       desc: "Valence trajectory & arc shape scoring" },
    { key: "platform_compliance" as const, label: "Platform Compliance", desc: "Hook window, format rules, caption timing" },
  ];
  return (
    <Reveal className="py-16 border-b border-[#292d30]">
      <SectionLabel>Layer Analysis</SectionLabel>
      <SectionHeading>Which dimension to fix</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {layers.map(({ key, label, desc }, i) => {
          const val = scores[key];
          const isLow = val < 60;
          return (
            <Card key={key} delay={i * 0.07}>
              <div>
                <span className="font-display font-semibold text-base block mb-1 text-[#ffffff]">{label}</span>
                <p className="text-[#a1a4a5] text-xs font-mono">{desc}</p>
              </div>
              <div>
                <AnimatedBar value={val} startDelay={i * 70 + 350} tone={isLow ? "alert" : "primary"} />
                <CountSpan value={val} className={`font-display font-extrabold text-5xl ${isLow ? "text-[#ff9592]" : "text-[#9281f7]"}`} startDelay={i * 70 + 350} />
              </div>
            </Card>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ─── S9 — DISTRIBUTION ───────────────────────────────────────── */
function Distribution({ data }: { data: AnalysisResult["distribution"] }) {
  const items = [
    { label: "Trend Alignment", score: data.trend_alignment, desc: "Your keywords are gaining momentum on Google Trends" },
    { label: "Account Health",  score: data.account_health,  desc: "Posting frequency and follower engagement look solid" },
    { label: "Posting Timing",  score: data.posting_timing,  desc: data.posting_time_recommendation },
  ];
  return (
    <Reveal className="py-16">
      <SectionLabel>Distribution</SectionLabel>
      <SectionHeading>Algorithm reach multiplier</SectionHeading>
      <p className="text-[#a1a4a5] text-sm mb-8 font-mono -mt-4">
        Combined multiplier: <span className="text-[#9281f7] font-bold text-base">×{data.multiplier}</span> on your organic reach.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map(({ label, score, desc }, i) => {
          const isLow = score < 5;
          return (
            <Card key={label} delay={i * 0.07}>
              <div>
                <span className="font-display font-semibold text-base block mb-1 text-[#ffffff]">{label}</span>
                <p className="text-[#a1a4a5] text-xs font-mono leading-relaxed">{desc}</p>
              </div>
              <div>
                <AnimatedBar value={score * 10} startDelay={i * 70 + 350} tone={isLow ? "alert" : "primary"} />
                <div className="flex items-end gap-1.5">
                  <CountSpan value={score} className={`font-display font-extrabold text-5xl leading-none ${isLow ? "text-[#ff9592]" : "text-[#9281f7]"}`} startDelay={i * 70 + 350} />
                  <span className="font-mono text-sm text-[#464a4d] mb-1">/10</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Reveal>
  );
}

/* ─── MASTER DASHBOARD ────────────────────────────────────────── */
export function ResultsDashboard({ result, onRescan }: { result: AnalysisResult; onRescan: () => void }) {
  return (
    <div className="max-w-[900px] mx-auto w-full px-5 md:px-0">
      <CompositeScore score={result.composite_score} layerScores={result.layer_scores} />
      <AiSummary text={result.ai_summary} />
      <PlatformScores scores={result.platform_scores} />
      <HookScore scores={result.hook_score} />
      <HookIterations items={result.hook_iterations} />
      <AttentionChart curve={result.attention_curve} drifts={result.drift_timestamps} />
      <EmotionalArcChart arc={result.emotional_arc} />
      <LayerBreakdown scores={result.layer_scores} />
      <Distribution data={result.distribution} />
      <Reveal className="py-16 flex items-center justify-center border-t border-graphite-hairline">
        <button type="button" onClick={onRescan}
          className="inline-flex items-center gap-2 rounded-button border border-graphite-hairline bg-transparent text-white font-body text-body-sm px-6 py-3 transition-colors duration-150 ease-out hover:border-white">
          Scan another video
        </button>
      </Reveal>
    </div>
  );
}
