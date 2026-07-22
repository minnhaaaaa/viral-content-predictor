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
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-px bg-[#292d30] border border-[#292d30] rounded-card overflow-hidden min-h-[480px]">
        <div className="relative bg-black min-h-[340px] overflow-hidden">
          <video ref={videoRef} muted loop playsInline className="w-full h-full object-cover" style={{ filter: "saturate(0.9) contrast(1.05)" }} />
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#9281f7] to-transparent opacity-60 pointer-events-none animate-scan-move" style={{ boxShadow: "0 0 14px #9281f7" }} />
          <div className="absolute inset-0 flex flex-col justify-between p-4 font-mono text-xs tracking-wide pointer-events-none"
            style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.6) 0%,transparent 25%,transparent 75%,rgba(0,0,0,0.65) 100%)" }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9281f7] flex-shrink-0 animate-pulse" />
              <span className="uppercase text-[#9281f7]">{status}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/60 truncate max-w-[60%]">{file.name}</span>
              <span className="text-white/80">{timeReadout}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#000000] flex flex-col p-5 gap-3 overflow-hidden">
          <div className="border border-[#292d30] rounded-xl px-4 py-3 bg-[#0b0e14]">
            <p className="font-mono text-xs text-[#464a4d] tracking-widest uppercase mb-1">Status</p>
            <p className="font-mono text-sm text-[#9281f7]">{status}</p>
          </div>

          <div className="w-full h-1 bg-[#292d30] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#9281f7]"
              initial={{ width: "0%" }} animate={{ width: "90%" }}
              transition={{ duration: 20, ease: "easeInOut" }}
              style={{ boxShadow: "0 0 8px rgba(146,129,247,0.5)" }}
            />
          </div>

          <div ref={logFeedRef} className="flex-1 font-mono text-[0.75rem] flex flex-col gap-1.5 overflow-y-auto min-h-[200px] py-1">
            {logs.map(log => (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex gap-2">
                <span className="text-[#464a4d] flex-shrink-0">{log.ts}</span>
                <span className={log.type === "flag" ? "text-[#ff9592]" : "text-[#a1a4a5]"}>{log.msg}</span>
              </motion.div>
            ))}
            {logs.length === 0 && <p className="text-[#464a4d] font-mono text-xs">Waiting for backend response…</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const title =
    error.kind === "network" ? "Cannot reach backend" :
    error.kind === "timeout" ? "Request timed out" :
    error.kind === "server" ? `Server error ${error.status}` :
    "Unexpected response";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-card border border-alarm-red/30 bg-black p-10 flex flex-col items-center text-center gap-6"
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,149,146,0.12)" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff9592" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div>
        <h3 className="font-display font-semibold text-xl text-white mb-2">{title}</h3>
        <p className="font-mono text-sm text-[#a1a4a5] max-w-[44ch] leading-relaxed">{error.message}</p>
      </div>
      {error.kind === "network" && (
        <div className="bg-[#000000] border border-[#292d30] rounded-xl p-4 text-left w-full max-w-sm">
          <p className="font-mono text-xs text-[#464a4d] mb-2 uppercase tracking-widest">Checklist</p>
          {["Backend is running on port 8000", "No firewall blocking localhost:8000", "CORS is enabled on /analyse endpoint"].map(s => (
            <div key={s} className="flex items-start gap-2 mt-1.5">
              <span className="text-[#464a4d] mt-0.5">→</span>
              <span className="font-mono text-xs text-[#a1a4a5]">{s}</span>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-button bg-signal-blue text-black font-body font-medium text-body-sm px-6 py-3 transition-colors duration-150 ease-out hover:bg-sky-blue">
        Try again
      </button>
    </motion.div>
  );
}

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
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-[#000000]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg className="w-full h-full"><defs><pattern id="sp-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="#292d30" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#sp-grid)"/></svg>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="relative flex flex-col items-center gap-8 px-6 text-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {[0, 0.35, 0.7].map((delay, i) => (
            <motion.div key={i} className="absolute inset-0 rounded-full border border-[#9281f7]/40"
              animate={{ scale: [1, 1.6 + i * 0.2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.6, repeat: Infinity, delay, ease: "easeInOut" }} />
          ))}
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
            <Image src="/logo.png" alt="XenrexAI brain" width={80} height={80} className="object-contain" />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="font-mono text-xs tracking-[0.28em] uppercase text-[#a1a4a5]">
            Analysis complete
          </motion.p>
          <TextScrambleHover text="VIDEO ANALYSED" autoPlay className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight text-white" />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.8 }} className="flex flex-col items-center gap-3 mt-2">
            <p className="font-mono text-xs text-[#a1a4a5] tracking-[0.2em] uppercase">Scroll to reveal your results</p>
            <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-1">
              <span className="w-px h-8 bg-gradient-to-b from-[#9281f7] to-transparent" />
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="text-[#9281f7]">
                <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

type Phase = "analyzing" | "fadeout" | "splash" | "results" | "error";

export function AnalysisStage({ file, formData, onRescan }: {
  file: File; formData: AnalysisFormData; onRescan: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("analyzing");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // React 18 Strict Mode intentionally mounts every component twice in
    // development: effect runs -> cleanup runs -> effect runs again. The
    // previous version called abortRef.current?.abort() unconditionally in
    // the cleanup, which cancelled the *first* (real) request as soon as
    // Strict Mode's synthetic remount fired its cleanup — so every fresh
    // "Scan" click failed once before Retry (a plain click, outside Strict
    // Mode's double-invoke path) finally got a request through uninterrupted.
    //
    // Fix: track whether *this specific effect instance* has been torn down
    // with a local flag, and only ignore the response (not abort the
    // network request) if this instance was the one cleaned up. The
    // request itself is allowed to complete either way, so Strict Mode's
    // extra mount/unmount cycle no longer cancels real user-initiated scans.
    let cancelled = false;
    const controller = new AbortController();
    abortRef.current = controller;

    analyseVideo(file, formData, controller.signal).then(res => {
      if (cancelled) return;
      if (res.ok) { setResult(res.data); setPhase("fadeout"); }
      else { setApiError(res.error); setPhase("error"); }
    });

    return () => {
      cancelled = true;
      // Do NOT abort the controller here — that would cancel the in-flight
      // request every time Strict Mode (or any other reason) unmounts this
      // effect, even though the component immediately remounts and needs
      // that same request's result. The AbortController still exists for
      // genuine cases like the user navigating away entirely (page unload).
    };
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
          <motion.div key="fadeout" className="fixed inset-0 z-[200] bg-[#000000]"
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
