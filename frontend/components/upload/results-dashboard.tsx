"use client";

import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { AnalysisResult } from "./result-types";

/* ─── tiny helpers ───────────────────────────────────────── */
function scoreColor(n: number) {
  if (n >= 80) return "text-primary";
  if (n >= 60) return "#f59e0b";
  return "#ff6b47";
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-primary mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      {children}
    </p>
  );
}

/* ─── Animated counter ───────────────────────────────────── */
function AnimatedNumber({
  value,
  suffix = "",
  className = "",
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(Math.round(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ─── 1. COMPOSITE SCORE ─────────────────────────────────── */
function CompositeScore({ score }: { score: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const circumference = 2 * Math.PI * 88;

  return (
    <FadeIn className="flex flex-col items-center text-center py-20 border-b border-white/[0.06]">
      <SectionLabel>Composite Score</SectionLabel>
      <h2 className="font-display font-semibold text-3xl md:text-5xl mb-12">
        Your video&apos;s overall read
      </h2>
      <div ref={ref} className="relative w-56 h-56 md:w-72 md:h-72 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="88" fill="none" stroke="#0a3a5a" strokeWidth="8" />
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="#00d4c8"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: circumference * (1 - score / 100) } : {}}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ filter: "drop-shadow(0 0 10px rgba(0,212,200,0.5))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber
            value={score}
            className="font-display font-extrabold text-6xl md:text-8xl text-primary leading-none"
          />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">
            /100
          </span>
        </div>
      </div>
      <p className="text-muted-foreground font-mono text-sm max-w-[42ch] text-center">
        Strong video with clear emotional arc. Platform compliance is the main drag — fix that and this becomes a top-10% post.
      </p>
    </FadeIn>
  );
}

/* ─── 2. PLATFORM SCORES ─────────────────────────────────── */
function PlatformScores({
  scores,
}: {
  scores: AnalysisResult["platform_scores"];
}) {
  const platforms = [
    { key: "tiktok", label: "TikTok", icon: "🎵" },
    { key: "reels", label: "Reels", icon: "📷" },
    { key: "shorts", label: "Shorts", icon: "▶" },
  ] as const;

  return (
    <FadeIn className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Platform Fit</SectionLabel>
      <h3 className="font-display font-semibold text-2xl md:text-3xl mb-10">
        Where this video performs best
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {platforms.map(({ key, label }, i) => {
          const val = scores[key];
          return (
            <FadeIn
              key={key}
              delay={i * 0.1}
              className="bg-[#041830] border border-border rounded-2xl p-6 md:p-8 flex flex-col gap-3 items-center text-center"
            >
              <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                {label}
              </span>
              <AnimatedNumber
                value={val}
                className={`font-display font-bold text-4xl md:text-6xl ${val >= 80 ? "text-primary" : val >= 65 ? "text-amber-400" : "text-alert"}`}
              />
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: val >= 80 ? "#00d4c8" : val >= 65 ? "#f59e0b" : "#ff6b47" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${val}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 + 0.3 }}
                />
              </div>
            </FadeIn>
          );
        })}
      </div>
    </FadeIn>
  );
}

/* ─── 3. LAYER BREAKDOWN ─────────────────────────────────── */
function LayerBreakdown({ scores }: { scores: AnalysisResult["layer_scores"] }) {
  const layers = [
    { key: "neural_visual", label: "Neural Visual", desc: "Frame saliency, motion, faces" },
    { key: "neural_audio", label: "Neural Audio", desc: "BPM sync, prosody, spectral surprise" },
    { key: "emotional_arc", label: "Emotional Arc", desc: "Valence trajectory & arc shape" },
    { key: "platform_compliance", label: "Platform Compliance", desc: "Hook window, format rules" },
  ] as const;

  return (
    <FadeIn className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Layer Analysis</SectionLabel>
      <h3 className="font-display font-semibold text-2xl md:text-3xl mb-10">
        Which dimension to fix
      </h3>
      <div className="flex flex-col gap-4">
        {layers.map(({ key, label, desc }, i) => {
          const val = scores[key];
          return (
            <FadeIn key={key} delay={i * 0.08} className="bg-[#041830] border border-border rounded-xl p-5 flex items-center gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-display font-semibold text-base">{label}</span>
                  <AnimatedNumber value={val} className={`font-mono text-lg font-bold ${val >= 80 ? "text-primary" : val >= 60 ? "text-amber-400" : "text-alert"}`} />
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-1.5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: val >= 80 ? "#00d4c8" : val >= 60 ? "#f59e0b" : "#ff6b47" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${val}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 + 0.3 }}
                  />
                </div>
                <span className="font-mono text-xs text-muted-foreground">{desc}</span>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </FadeIn>
  );
}

/* ─── 4. ATTENTION CURVE + DRIFT TIMESTAMPS ─────────────── */
function AttentionChart({
  curve,
  drifts,
}: {
  curve: AnalysisResult["attention_curve"];
  drifts: AnalysisResult["drift_timestamps"];
}) {
  const W = 600, H = 160;
  const maxSec = curve[curve.length - 1].second;
  const toX = (s: number) => (s / maxSec) * W;
  const toY = (v: number) => H - (v / 100) * H;

  const linePath = curve
    .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.second).toFixed(1)},${toY(p.score).toFixed(1)}`)
    .join(" ");
  const fillPath = `M0,${H} ${curve.map((p) => `L${toX(p.second).toFixed(1)},${toY(p.score).toFixed(1)}`).join(" ")} L${W},${H} Z`;

  return (
    <FadeIn className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Attention Curve</SectionLabel>
      <h3 className="font-display font-semibold text-2xl md:text-3xl mb-3">
        Where viewers drift
      </h3>
      <p className="text-muted-foreground text-sm mb-8 font-mono">
        Red lines mark hard drop-off points. Hover for details.
      </p>

      <div className="bg-[#041830] border border-border rounded-2xl p-6 mb-6 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full min-w-[320px]" style={{ height: 200 }}>
          {/* grid lines */}
          {[25, 50, 75, 100].map((v) => (
            <line key={v} x1={0} y1={toY(v)} x2={W} y2={toY(v)} stroke="#071f38" strokeWidth="1" />
          ))}
          {/* fill */}
          <motion.path d={fillPath} fill="rgba(0,212,200,0.06)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
          {/* line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#00d4c8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(0,212,200,0.5))" }}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {/* drift lines */}
          {drifts.map((d) => (
            <g key={d.time}>
              <motion.line
                x1={toX(d.time)} y1={0} x2={toX(d.time)} y2={H}
                stroke="#ff6b47" strokeWidth="1.5" strokeDasharray="4 3"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.5 }}
              />
              <circle cx={toX(d.time)} cy={toY(curve.find(p => p.second === Math.round(d.time))?.score ?? 50)} r="4" fill="#ff6b47" style={{ filter: "drop-shadow(0 0 5px #ff6b47)" }} />
            </g>
          ))}
          {/* x labels */}
          {curve.filter((_, i) => i % 4 === 0).map((p) => (
            <text key={p.second} x={toX(p.second)} y={H + 16} textAnchor="middle" className="fill-border" style={{ fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>{p.second}s</text>
          ))}
        </svg>
      </div>

      {/* Drift cards */}
      <div className="flex flex-col gap-3">
        {drifts.map((d, i) => (
          <FadeIn key={i} delay={i * 0.1} className="bg-[#041830] border border-alert/30 rounded-xl p-5 flex gap-4 items-start">
            <div className="flex-shrink-0">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-alert/10 text-alert border border-alert/20 uppercase tracking-wider">
                {d.severity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="font-mono text-primary text-sm font-bold">{d.time.toFixed(1)}s</span>
                <span className="font-display font-semibold text-sm">{d.cause}</span>
              </div>
              <p className="text-muted-foreground text-xs font-mono">
                → {d.recommendation}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </FadeIn>
  );
}

/* ─── 5. EMOTIONAL ARC ───────────────────────────────────── */
function EmotionalArcChart({ arc }: { arc: AnalysisResult["emotional_arc"] }) {
  const W = 600, H = 160, midY = H / 2;
  const maxSec = arc[arc.length - 1].second;
  const toX = (s: number) => (s / maxSec) * W;
  const toY = (v: number) => midY - v * (H / 2 - 8);

  const posPath = arc.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.second).toFixed(1)},${toY(p.valence).toFixed(1)}`).join(" ");

  return (
    <FadeIn className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Emotional Arc</SectionLabel>
      <h3 className="font-display font-semibold text-2xl md:text-3xl mb-3">
        How the viewer feels, second by second
      </h3>
      <p className="text-muted-foreground text-sm mb-8 font-mono">
        Above the line = positive. Below = negative. Ideal arc: negative open → positive peak → strong close.
      </p>
      <div className="bg-[#041830] border border-border rounded-2xl p-6 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full min-w-[320px]" style={{ height: 200 }}>
          {/* centre line */}
          <line x1={0} y1={midY} x2={W} y2={midY} stroke="#0a3a5a" strokeWidth="1.5" />
          <text x={4} y={midY - 6} className="fill-border" style={{ fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>+</text>
          <text x={4} y={midY + 14} className="fill-border" style={{ fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>−</text>
          {/* fill above */}
          <motion.path
            d={`M0,${midY} ${arc.map(p => `L${toX(p.second).toFixed(1)},${toY(Math.max(p.valence, 0)).toFixed(1)}`).join(" ")} L${W},${midY} Z`}
            fill="rgba(0,212,200,0.12)"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          />
          {/* fill below */}
          <motion.path
            d={`M0,${midY} ${arc.map(p => `L${toX(p.second).toFixed(1)},${toY(Math.min(p.valence, 0)).toFixed(1)}`).join(" ")} L${W},${midY} Z`}
            fill="rgba(255,107,71,0.12)"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          />
          {/* line */}
          <motion.path
            d={posPath}
            fill="none" stroke="#00d4c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 5px rgba(0,212,200,0.4))" }}
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {/* x labels */}
          {arc.filter((_, i) => i % 4 === 0).map((p) => (
            <text key={p.second} x={toX(p.second)} y={H + 16} textAnchor="middle" className="fill-border" style={{ fontSize: 9, fontFamily: "Fragment Mono, monospace" }}>{p.second}s</text>
          ))}
        </svg>
      </div>
    </FadeIn>
  );
}

/* ─── 6. HOOK SCORE ──────────────────────────────────────── */
function HookScore({ scores }: { scores: AnalysisResult["hook_score"] }) {
  const platforms = [
    { key: "tiktok", label: "TikTok" },
    { key: "reels", label: "Reels" },
    { key: "shorts", label: "Shorts" },
  ] as const;

  return (
    <FadeIn className="py-16 border-b border-white/[0.06]">
      <SectionLabel>Hook Score</SectionLabel>
      <h3 className="font-display font-semibold text-2xl md:text-3xl mb-3">
        Opening seconds, per platform
      </h3>
      <p className="text-muted-foreground text-sm mb-8 font-mono">
        Based on the first 1–3 seconds: novelty, motion, face presence.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {platforms.map(({ key, label }, i) => {
          const val = scores[key];
          return (
            <FadeIn key={key} delay={i * 0.1} className="bg-[#041830] border border-border rounded-2xl p-6 text-center flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
              <AnimatedNumber value={val} className={`font-display font-bold text-4xl md:text-5xl ${val >= 85 ? "text-primary" : val >= 70 ? "text-amber-400" : "text-alert"}`} />
              <span className="font-mono text-xs text-muted-foreground">/100</span>
            </FadeIn>
          );
        })}
      </div>
    </FadeIn>
  );
}

/* ─── 7. DISTRIBUTION ────────────────────────────────────── */
function Distribution({ data }: { data: AnalysisResult["distribution"] }) {
  const items = [
    { key: "trend_alignment", label: "Trend Alignment", score: data.trend_alignment, desc: "Your keywords are gaining momentum on Google Trends" },
    { key: "account_health", label: "Account Health", score: data.account_health, desc: "Posting frequency and follower engagement look solid" },
    { key: "posting_timing", label: "Posting Timing", score: data.posting_timing, desc: data.posting_time_recommendation },
  ] as const;

  return (
    <FadeIn className="py-16">
      <SectionLabel>Distribution</SectionLabel>
      <h3 className="font-display font-semibold text-2xl md:text-3xl mb-3">
        How the algorithm will push this
      </h3>
      <p className="text-muted-foreground text-sm mb-8 font-mono">
        Combined multiplier:{" "}
        <span className="text-primary font-bold">×{data.multiplier}</span> — applied to your organic reach estimate.
      </p>
      <div className="flex flex-col gap-4">
        {items.map(({ key, label, score, desc }, i) => (
          <FadeIn key={key} delay={i * 0.1} className="bg-[#041830] border border-border rounded-xl p-5 flex items-center gap-5">
            <div className="flex-shrink-0 w-16 text-center">
              <AnimatedNumber value={score} suffix="/10" className={`font-display font-bold text-2xl ${score >= 7 ? "text-primary" : score >= 5 ? "text-amber-400" : "text-alert"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm mb-0.5">{label}</p>
              <p className="text-muted-foreground text-xs font-mono">{desc}</p>
            </div>
            <div className="hidden md:flex flex-col gap-1 items-end">
              <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: score >= 7 ? "#00d4c8" : score >= 5 ? "#f59e0b" : "#ff6b47" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${score * 10}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 + 0.3 }}
                />
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </FadeIn>
  );
}

/* ─── MASTER RESULTS DASHBOARD ───────────────────────────── */
export function ResultsDashboard({
  result,
  onRescan,
}: {
  result: AnalysisResult;
  onRescan: () => void;
}) {
  return (
    <div className="max-w-[860px] mx-auto w-full">
      <CompositeScore score={result.composite_score} />
      <PlatformScores scores={result.platform_scores} />
      <HookScore scores={result.hook_score} />
      <AttentionChart curve={result.attention_curve} drifts={result.drift_timestamps} />
      <EmotionalArcChart arc={result.emotional_arc} />
      <LayerBreakdown scores={result.layer_scores} />
      <Distribution data={result.distribution} />

      <FadeIn className="py-16 flex items-center justify-center gap-6 flex-wrap border-t border-white/[0.06]">
        <button
          type="button"
          onClick={onRescan}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-mono font-bold text-sm tracking-wide uppercase px-7 py-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.25)]"
        >
          Scan another video
        </button>
      </FadeIn>
    </div>
  );
}
