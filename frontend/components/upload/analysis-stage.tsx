"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { TextScrambleHover } from "@/components/ui/text-scramble-hover";
import { ResultsDashboard } from "./results-dashboard";
import { MOCK_RESULT } from "./result-types";

/* ─── constants ─────────────────────────────────────────────── */
const LOG_SCRIPT: {
  t: number;
  msg: string;
  type: "status" | "normal" | "good" | "flag";
}[] = [
  { t: 0.0, msg: "Calibrating frame buffer…", type: "status" },
  { t: 0.6, msg: "Visual cortex pass — motion & composition", type: "normal" },
  { t: 1.5, msg: "Faces detected in opening frames", type: "good" },
  { t: 2.4, msg: "Hook window scored — strong novelty signal", type: "good" },
  { t: 3.2, msg: "Mapping arousal curve from pacing & audio", type: "normal" },
  { t: 4.2, msg: "Voice prosody and BPM sync calculated", type: "normal" },
  { t: 5.1, msg: "Emotional peak detected at 0:07", type: "good" },
  { t: 6.0, msg: "Pacing flattens — attention drift at 0:46", type: "flag" },
  { t: 7.0, msg: "Cross-referencing trend data & account health", type: "normal" },
  { t: 7.8, msg: "Post timing evaluated — window is suboptimal", type: "flag" },
  { t: 8.6, msg: "Fusing all signals into final read…", type: "normal" },
];

const FINAL_CURVE = [55, 68, 90, 86, 22, 30, 45, 74, 82, 75, 44, 19, 35, 67, 73].map(v => v / 100);
const TOTAL_DURATION = 9.6;

function formatTime(s: number) {
  if (!isFinite(s)) return "00:00";
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

interface LogLine { id: number; msg: string; type: "normal" | "good" | "flag"; ts: string; }

/* ─── Analysis screen ───────────────────────────────────────── */
function AnalysisScreen({ file, onComplete }: { file: File; onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Calibrating frame buffer…");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [timeReadout, setTimeReadout] = useState("00:00 / 00:00");
  const [attnNow, setAttnNow] = useState("—");
  const [curvePoints, setCurvePoints] = useState<[number, number][]>([[0, 80]]);
  const logFeedRef = useRef<HTMLDivElement>(null);
  const videoUrl = useRef("");

  useEffect(() => {
    videoUrl.current = URL.createObjectURL(file);
    const video = videoRef.current;
    if (video) { video.src = videoUrl.current; video.play().catch(() => {}); }
    return () => { if (videoUrl.current) URL.revokeObjectURL(videoUrl.current); };
  }, [file]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let idCounter = 0;
    LOG_SCRIPT.forEach(({ t, msg, type }) => {
      timers.push(setTimeout(() => {
        if (type === "status") { setStatus(msg); return; }
        idCounter++;
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        setLogs(prev => [...prev, { id: idCounter, msg, type: type as "normal" | "good" | "flag", ts }]);
      }, t * 1000));
    });

    const start = performance.now();
    let raf: number;
    function frame() {
      const elapsed = (performance.now() - start) / 1000;
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);
      drawCurve(progress);
      const video = videoRef.current;
      if (video) setTimeReadout(`${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`);
      if (progress < 1) { raf = requestAnimationFrame(frame); }
      else { setTimeout(onComplete, 400); }
    }
    raf = requestAnimationFrame(frame);
    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }, [onComplete]);

  useEffect(() => {
    if (logFeedRef.current) logFeedRef.current.scrollTop = logFeedRef.current.scrollHeight;
  }, [logs]);

  function drawCurve(progress: number) {
    const w = 400, h = 80;
    const n = FINAL_CURVE.length;
    const visibleCount = Math.max(1, Math.floor(progress * n) + 1);
    const points: [number, number][] = [];
    for (let i = 0; i < visibleCount; i++) {
      const noise = i === visibleCount - 1 ? (Math.random() - 0.5) * 0.08 : 0;
      const x = (i / (n - 1)) * w;
      const y = h - Math.max(0, Math.min(1, FINAL_CURVE[i] + noise)) * h;
      points.push([x, y]);
    }
    if (points.length === 1) points.push(points[0]);
    setCurvePoints(points);
    const liveVal = FINAL_CURVE[Math.min(visibleCount - 1, n - 1)];
    setAttnNow(`${Math.round(liveVal * 100)}%`);
  }

  const linePath = curvePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fillPath = `M0,80 ${curvePoints.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")} L${curvePoints[curvePoints.length - 1][0].toFixed(1)},80 Z`;
  const lastPt = curvePoints[curvePoints.length - 1];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-px bg-border border border-border rounded-[18px] overflow-hidden min-h-[480px]">
        <div className="relative bg-black min-h-[340px] overflow-hidden">
          <video ref={videoRef} muted loop playsInline className="w-full h-full object-cover" style={{ filter: "saturate(0.9) contrast(1.05)" }} />
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 pointer-events-none" style={{ animation: "scanMove 3.2s ease-in-out infinite", boxShadow: "0 0 14px #00d4c8" }} />
          <div className="absolute inset-0 flex flex-col justify-between p-4 font-mono text-xs tracking-wide pointer-events-none" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.6) 0%,transparent 25%,transparent 75%,rgba(0,0,0,0.65) 100%)" }}>
            <div className="flex items-center gap-2">
              <span className="w-[7px] h-[7px] rounded-full bg-primary flex-shrink-0 animate-pulse" />
              <span className="uppercase text-primary">{status}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground truncate max-w-[60%]">{file.name}</span>
              <span className="text-foreground">{timeReadout}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#041830] flex flex-col p-5 gap-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-xl px-4 pt-4 pb-2.5">
            <div className="flex justify-between items-baseline mb-2.5">
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-muted-foreground">Attention curve</span>
              <span className="font-mono text-sm text-primary">{attnNow}</span>
            </div>
            <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-20 block overflow-visible">
              <path d="M0,20 L400,20 M0,40 L400,40 M0,60 L400,60" stroke="#071f38" strokeWidth="1" fill="none" />
              <path d={fillPath} fill="rgba(0,212,200,0.08)" stroke="none" />
              <path d={linePath} fill="none" stroke="#00d4c8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 5px rgba(0,212,200,0.4))" }} />
              <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill="#00d4c8" style={{ filter: "drop-shadow(0 0 6px rgba(0,212,200,0.8))" }} />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border border border-border rounded-xl overflow-hidden">
            {[{ label: "Neural Visual" }, { label: "Neural Audio" }, { label: "Emotional Arc" }, { label: "Platform" }].map(m => (
              <div key={m.label} className="bg-background px-3 py-3 flex flex-col gap-1">
                <span className="font-mono text-[0.65rem] tracking-wider uppercase text-muted-foreground">{m.label}</span>
                <span className="font-display text-xl font-semibold text-foreground">—</span>
              </div>
            ))}
          </div>

          <div ref={logFeedRef} className="flex-1 font-mono text-[0.75rem] text-muted-foreground flex flex-col gap-1.5 min-h-[100px] py-1 overflow-y-auto">
            {logs.map(log => (
              <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }} className="flex gap-2">
                <span className="text-border flex-shrink-0">{log.ts}</span>
                <span className={log.type === "flag" ? "text-alert" : log.type === "good" ? "text-primary" : ""}>{log.msg}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Splash — stays until scroll, brain logo, no bleed-through ─ */
function AnalysedSplash({ onScrollAway }: { onScrollAway: () => void }) {
  useEffect(() => {
    // Lock body scroll while splash is up
    document.body.style.overflow = "hidden";
    let active = false;
    const enable = setTimeout(() => { active = true; }, 900);

    let ticking = false;
    function handleScroll() {
      if (!active || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        document.body.style.overflow = "";
        onScrollAway();
      });
    }
    // Listen on window and on document
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    return () => {
      clearTimeout(enable);
      document.body.style.overflow = "";
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
    };
  }, [onScrollAway]);

  return (
    // z-[300] ensures it is above the analysis screen, the fadeout overlay, and everything else
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(0,212,200,0.14) 0%, transparent 70%)" }} />

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id="sp-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="#00d4c8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sp-grid)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-8 px-6 text-center"
      >
        {/* Brain logo with pulsing rings */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {[0, 0.35, 0.7].map((delay, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/40"
              animate={{ scale: [1, 1.6 + i * 0.2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.6, repeat: Infinity, delay, ease: "easeInOut" }}
            />
          ))}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 18px rgba(0,212,200,0.55))" }}
          >
            <Image
              src="/logo.png"
              alt="XenrexAI brain"
              width={80}
              height={80}
              className="object-contain"
            />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="font-mono text-xs tracking-[0.28em] uppercase text-muted-foreground"
          >
            Analysis complete
          </motion.p>

          <TextScrambleHover
            text="VIDEO ANALYSED"
            autoPlay
            className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight"
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="flex flex-col items-center gap-3 mt-2"
          >
            <p className="font-mono text-xs text-muted-foreground tracking-[0.2em] uppercase">
              Scroll to reveal your results
            </p>
            <motion.div
              animate={{ y: [0, 9, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1"
            >
              <span className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="text-primary">
                <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Master orchestrator ────────────────────────────────── */
type Phase = "analyzing" | "fadeout" | "splash" | "results";

export function AnalysisStage({ file, onRescan }: { file: File; onRescan: () => void }) {
  const [phase, setPhase] = useState<Phase>("analyzing");

  const handleAnalysisComplete = useCallback(() => setPhase("fadeout"), []);

  const handleSplashScrollAway = useCallback(() => {
    setPhase("results");
    // Two rAFs: first lets React mount the results DOM, second lets layout settle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const anchor = document.getElementById("results-anchor");
        if (anchor) {
          // Smooth scroll to results for a polished transition
          const top = anchor.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    });
  }, []);

  return (
    <>
      {/* Fade-to-background overlay — z-[200], covers the analysis screen fully */}
      <AnimatePresence>
        {phase === "fadeout" && (
          <motion.div
            key="fadeout"
            className="fixed inset-0 z-[200] bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            onAnimationComplete={() => setPhase("splash")}
          />
        )}
      </AnimatePresence>

      {/* Splash — z-[300], fully opaque background, no bleed-through */}
      <AnimatePresence>
        {phase === "splash" && (
          <AnalysedSplash key="splash" onScrollAway={handleSplashScrollAway} />
        )}
      </AnimatePresence>

      {/* Analysis screen — only shown during "analyzing" phase */}
      <AnimatePresence>
        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnalysisScreen file={file} onComplete={handleAnalysisComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results — mounted only after splash */}
      {phase === "results" && (
        <>
          {/* Anchor is a block-level element at the very top, not nested in anything relative */}
          <div
            id="results-anchor"
            style={{ scrollMarginTop: "80px" }}
          />
          <motion.div
            id="analysis-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <ResultsDashboard result={MOCK_RESULT} onRescan={onRescan} />
          </motion.div>
        </>
      )}
    </>
  );
}
