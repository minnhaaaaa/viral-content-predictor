"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { TextScrambleHover } from "@/components/ui/text-scramble-hover";
import { ResultsDashboard } from "./results-dashboard";
import { AnalysisResult } from "./result-types";
import { AnalysisFormData } from "./types";
import { analyseVideo, ApiError } from "@/lib/api";

function formatTime(s: number) {
  if (!isFinite(s)) return "00:00";
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
function pad(n: number) { return String(n).padStart(2, "0"); }
function nowTs() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

interface LogLine { id: number; msg: string; type: "normal" | "good" | "flag"; ts: string }

const AMBIENT_LOGS: { t: number; msg: string; type: "status" | "normal" | "flag" }[] = [
  { t: 0.4,  msg: "Calibrating frame buffer…",                     type: "status" },
  { t: 1.2,  msg: "Visual cortex pass — motion & composition",     type: "normal" },
  { t: 2.6,  msg: "Scanning for faces and gaze pull…",             type: "normal" },
  { t: 4.0,  msg: "Mapping arousal curve from pacing & audio",     type: "normal" },
  { t: 5.8,  msg: "Voice prosody and BPM sync calculated",         type: "normal" },
  { t: 7.5,  msg: "Cross-referencing trend data & account health", type: "normal" },
  { t: 9.2,  msg: "Fusing all signals into final read…",           type: "normal" },
  { t: 11.0, msg: "Still processing — large file or cold start",   type: "flag"   },
  { t: 14.0, msg: "Almost there…",                                  type: "normal" },
];

/* ─── Live analysis screen (video plays; navy tone reserved for the
       video pane only, since it's showing real footage) ─────────── */
function AnalysisScreen({ file }: { file: File; formData: AnalysisFormData }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Connecting to XenrexAI…");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [timeReadout, setTimeReadout] = useState("00:00 / 00:00");
  const logFeedRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    AMBIENT_LOGS.forEach(({ t, msg, type }) => {
      timers.push(setTimeout(() => {
        if (type === "status") { setStatus(msg); return; }
        idRef.current++;
        setLogs(prev => [...prev, { id: idRef.current, msg, type, ts: nowTs() }]);
      }, t * 1000));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (logFeedRef.current) logFeedRef.current.scrollTop = logFeedRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const v = videoRef.current;
    if (v) { v.src = url; v.play().catch(() => {}); }
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const fn = () => setTimeReadout(`${formatTime(v.currentTime)} / ${formatTime(v.duration || 0)}`);
    v.addEventListener("timeupdate", fn);
    return () => v.removeEventListener("timeupdate", fn);
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-px rounded-[20px] overflow-hidden min-h-[480px] border border-mist shadow-card">
        {/* Video pane — dark, because it's displaying real footage */}
        <div className="relative bg-[#0a1628] min-h-[340px] overflow-hidden">
          <video ref={videoRef} muted loop playsInline className="w-full h-full object-cover" style={{ filter: "saturate(0.9) contrast(1.05)" }} />
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60 pointer-events-none animate-scan-move" />
          <div className="absolute inset-0 flex flex-col justify-between p-4 font-mono text-xs tracking-wide pointer-events-none"
            style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.55) 0%,transparent 25%,transparent 75%,rgba(0,0,0,0.6) 100%)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white flex-shrink-0 animate-pulse" />
              <span className="uppercase text-white">{status}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/60 truncate max-w-[60%]">{file.name}</span>
              <span className="text-white/80">{timeReadout}</span>
            </div>
          </div>
        </div>

        {/* Log pane — white, navy text */}
        <div className="bg-white flex flex-col p-5 gap-3 overflow-hidden">
          <div className="border border-mist rounded-2xl px-4 py-3 bg-white">
            <p className="font-mono text-xs text-ash tracking-widest uppercase mb-1">Status</p>
            <p className="font-mono text-sm text-primary">{status}</p>
          </div>

          <div className="w-full h-1 bg-mist rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "90%" }}
              transition={{ duration: 20, ease: "easeInOut" }}
            />
          </div>

          <div ref={logFeedRef} className="flex-1 font-mono text-[0.75rem] flex flex-col gap-1.5 overflow-y-auto min-h-[200px] py-1">
            {logs.map(log => (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex gap-2">
                <span className="text-ash flex-shrink-0">{log.ts}</span>
                <span className={log.type === "flag" ? "text-alert" : "text-stone"}>{log.msg}</span>
              </motion.div>
            ))}
            {logs.length === 0 && <p className="text-ash font-mono text-xs">Waiting for backend response…</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Error screen — white card, navy accent ─────────────────── */
function ErrorScreen({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const title =
    error.kind === "network" ? "Cannot reach backend" :
    error.kind === "timeout" ? "Request timed out" :
    error.kind === "server" ? `Server error ${error.status}` :
    "Unexpected response";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] bg-white p-10 flex flex-col items-center text-center gap-6 border border-mist shadow-card"
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(200,73,46,0.08)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8492e" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div>
        <h3 className="font-display font-semibold text-xl text-ink mb-2">{title}</h3>
        <p className="font-mono text-sm text-stone max-w-[44ch] leading-relaxed">{error.message}</p>
      </div>
      {error.kind === "network" && (
        <div className="bg-[#f7fafd] border border-mist rounded-2xl p-4 text-left w-full max-w-sm">
          <p className="font-mono text-xs text-ash mb-2 uppercase tracking-widest">Checklist</p>
          {["Backend is running on port 8000", "No firewall blocking localhost:8000", "CORS is enabled on /analyse endpoint"].map(s => (
            <div key={s} className="flex items-start gap-2 mt-1.5">
              <span className="text-ash mt-0.5">→</span>
              <span className="font-mono text-xs text-stone">{s}</span>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full bg-primary text-white text-[16px] font-semibold px-7 py-3 transition-all hover:bg-[#004a8f] hover:-translate-y-0.5 shadow-btn"
        style={{ letterSpacing: "0.015em" }}>
        Try again
      </button>
    </motion.div>
  );
}

/* ─── "Video Analysed" splash — pure white canvas, navy accent ── */
function AnalysedSplash({ onScrollAway }: { onScrollAway: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    let active = false;
    const enable = setTimeout(() => { active = true; }, 900);
    function handle() { if (!active) return; document.body.style.overflow = ""; onScrollAway(); }
    window.addEventListener("scroll", handle, { passive: true });
    window.addEventListener("wheel", handle, { passive: true });
    window.addEventListener("touchmove", handle, { passive: true });
    return () => {
      clearTimeout(enable);
      document.body.style.overflow = "";
      window.removeEventListener("scroll", handle);
      window.removeEventListener("wheel", handle);
      window.removeEventListener("touchmove", handle);
    };
  }, [onScrollAway]);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-white"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(0,53,102,0.05) 0%, transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="relative flex flex-col items-center gap-8 px-6 text-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {[0, 0.35, 0.7].map((delay, i) => (
            <motion.div key={i} className="absolute inset-0 rounded-full border border-primary/25"
              animate={{ scale: [1, 1.6 + i * 0.2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.6, repeat: Infinity, delay, ease: "easeInOut" }} />
          ))}
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 8px 20px rgba(0,53,102,0.25))" }}>
            <Image src="/logo.png" alt="XenrexAI brain" width={80} height={80} className="object-contain" />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
            className="font-mono text-xs tracking-[0.28em] uppercase text-stone">
            Analysis complete
          </motion.p>
          <TextScrambleHover text="VIDEO ANALYSED" autoPlay className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight text-ink" />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.8 }} className="flex flex-col items-center gap-3 mt-2">
            <p className="font-mono text-xs text-ash tracking-[0.2em] uppercase">Scroll to reveal your results</p>
            <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-1">
              <span className="w-px h-8 bg-gradient-to-b from-primary to-transparent" />
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="text-primary">
                <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Master orchestrator ─────────────────────────────────────── */
type Phase = "analyzing" | "fadeout" | "splash" | "results" | "error";

export function AnalysisStage({ file, formData, onRescan }: {
  file: File; formData: AnalysisFormData; onRescan: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("analyzing");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current = new AbortController();
    analyseVideo(file, formData, abortRef.current.signal).then(res => {
      if (res.ok) { setResult(res.data); setPhase("fadeout"); }
      else { setApiError(res.error); setPhase("error"); }
    });
    return () => { abortRef.current?.abort(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSplashScrollAway = useCallback(() => {
    setPhase("results");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const anchor = document.getElementById("results-anchor");
        if (anchor) {
          const top = anchor.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
        }
      });
    });
  }, []);

  const handleRetry = useCallback(() => {
    setApiError(null);
    setPhase("analyzing");
    abortRef.current = new AbortController();
    analyseVideo(file, formData, abortRef.current.signal).then(res => {
      if (res.ok) { setResult(res.data); setPhase("fadeout"); }
      else { setApiError(res.error); setPhase("error"); }
    });
  }, [file, formData]);

  return (
    <>
      <AnimatePresence>
        {phase === "fadeout" && (
          <motion.div key="fadeout" className="fixed inset-0 z-[200] bg-white"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
            onAnimationComplete={() => setPhase("splash")} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "splash" && <AnalysedSplash key="splash" onScrollAway={handleSplashScrollAway} />}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "analyzing" && (
          <motion.div key="analyzing" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <AnalysisScreen file={file} formData={formData} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "error" && apiError && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <ErrorScreen error={apiError} onRetry={handleRetry} />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "results" && result && (
        <motion.div id="analysis-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <div id="results-anchor" />
          <ResultsDashboard result={result} onRescan={onRescan} />
        </motion.div>
      )}
    </>
  );
}
