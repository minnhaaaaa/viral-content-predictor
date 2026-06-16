"use client";

import React, { useEffect, useRef, useState } from "react";

const LOG_SCRIPT: { t: number; msg: string; type: "status" | "normal" | "good" | "flag" }[] = [
  { t: 0.0, msg: "Calibrating frame buffer…", type: "status" },
  { t: 0.5, msg: "Visual cortex pass — motion & composition", type: "normal" },
  { t: 1.4, msg: "Faces detected in opening frames", type: "good" },
  { t: 2.2, msg: "Hook window scored — strong novelty signal", type: "good" },
  { t: 3.0, msg: "Mapping arousal curve from pacing & audio", type: "normal" },
  { t: 4.0, msg: "Voice prosody and BPM sync calculated", type: "normal" },
  { t: 4.8, msg: "Emotional peak detected at 0:07", type: "good" },
  { t: 5.8, msg: "Pacing flattens — attention drift likely at 0:46", type: "flag" },
  { t: 6.8, msg: "Cross-referencing trend data & account health", type: "normal" },
  { t: 7.6, msg: "Post timing evaluated — window is suboptimal", type: "flag" },
  { t: 8.4, msg: "Fusing all signals into final read…", type: "normal" },
];

const ATTENTION_CURVE = [0.55, 0.78, 0.9, 0.86, 0.7, 0.5, 0.38, 0.46, 0.62, 0.58, 0.4, 0.3];
const TOTAL_LOG_DURATION = 9.0;

function formatTime(s: number) {
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

interface LogLine {
  id: number;
  msg: string;
  type: "normal" | "good" | "flag";
  ts: string;
}

export function AnalysisStage({
  file,
  onRescan,
}: {
  file: File;
  onRescan: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Calibrating frame buffer…");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [timeReadout, setTimeReadout] = useState("00:00 / 00:00");
  const [attnNow, setAttnNow] = useState("—");
  const [curvePoints, setCurvePoints] = useState<[number, number][]>([[0, 80]]);
  const [done, setDone] = useState(false);
  const [metrics, setMetrics] = useState({
    hook: "—",
    peaks: "—",
    drop: "—",
    retention: "—",
  });

  const logFeedRef = useRef<HTMLDivElement>(null);
  const videoUrl = useRef<string>("");

  useEffect(() => {
    videoUrl.current = URL.createObjectURL(file);
    const video = videoRef.current;
    if (video) {
      video.src = videoUrl.current;
      video.play().catch(() => {});
    }
    return () => {
      if (videoUrl.current) URL.revokeObjectURL(videoUrl.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let idCounter = 0;

    LOG_SCRIPT.forEach(({ t, msg, type }) => {
      const timer = setTimeout(() => {
        if (type === "status") {
          setStatus(msg);
          return;
        }
        idCounter += 1;
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        setLogs((prev) => [
          ...prev,
          { id: idCounter, msg, type: type as "normal" | "good" | "flag", ts },
        ]);
      }, t * 1000);
      timers.push(timer);
    });

    const startTime = performance.now();
    let raf: number;

    function frame() {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(elapsed / TOTAL_LOG_DURATION, 1);
      drawCurve(progress);

      const video = videoRef.current;
      if (video) {
        setTimeReadout(
          `${formatTime(video.currentTime)} / ${formatTime(video.duration || 0)}`
        );
      }

      if (progress < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        finishAnalysis();
      }
    }
    raf = requestAnimationFrame(frame);

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (logFeedRef.current) {
      logFeedRef.current.scrollTop = logFeedRef.current.scrollHeight;
    }
  }, [logs]);

  function drawCurve(progress: number) {
    const w = 400,
      h = 80;
    const n = ATTENTION_CURVE.length;
    const visibleCount = Math.max(1, Math.floor(progress * n) + 1);
    const points: [number, number][] = [];
    for (let i = 0; i < visibleCount; i++) {
      const x = (i / (n - 1)) * w;
      const y = h - ATTENTION_CURVE[i] * h;
      points.push([x, y]);
    }
    if (points.length === 1) points.push(points[0]);
    setCurvePoints(points);
    const liveVal = ATTENTION_CURVE[Math.min(visibleCount - 1, n - 1)];
    setAttnNow(`${Math.round(liveVal * 100)}%`);
  }

  function finishAnalysis() {
    setStatus("Read complete");
    setMetrics({
      hook: "8.7 / 10",
      peaks: "3",
      drop: "0:46",
      retention: "64%",
    });
    setDone(true);
  }

  const linePath = curvePoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const fillPath = `M0,80 ${curvePoints
    .map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ")} L${curvePoints[curvePoints.length - 1][0].toFixed(1)},80 Z`;
  const lastPoint = curvePoints[curvePoints.length - 1];

  return (
    <div className="animate-[stage-in_0.6s_ease-out]">
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-px bg-border border border-border rounded-[18px] overflow-hidden min-h-[480px]">
        {/* Video pane */}
        <div className="relative bg-black min-h-[360px] md:min-h-0 aspect-video md:aspect-auto overflow-hidden">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            className="w-full h-full object-cover block"
            style={{ filter: "saturate(0.9) contrast(1.05)" }}
          />
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 shadow-[0_0_14px_#00d4c8] animate-scan-move pointer-events-none" />
          <div
            className="absolute inset-0 flex flex-col justify-between p-4 font-mono text-xs tracking-wide text-foreground pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.65) 100%)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="w-[7px] h-[7px] rounded-full bg-primary flex-shrink-0 animate-pulse-dot" />
              <span className="uppercase text-primary">{status}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground truncate max-w-[60%]">
                {file.name}
              </span>
              <span>{timeReadout}</span>
            </div>
          </div>
        </div>

        {/* Readout pane */}
        <div className="bg-[#041830] flex flex-col p-5 gap-4 overflow-y-auto">
          <div className="bg-background border border-border rounded-xl px-[1.1rem] pt-4 pb-2.5">
            <div className="flex justify-between items-baseline mb-2.5">
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-muted-foreground">
                Attention curve
              </span>
              <span className="font-mono text-sm text-primary">{attnNow}</span>
            </div>
            <svg
              viewBox="0 0 400 80"
              preserveAspectRatio="none"
              className="w-full h-20 block overflow-visible"
            >
              <path
                d="M0,20 L400,20 M0,40 L400,40 M0,60 L400,60"
                stroke="#071f38"
                strokeWidth="1"
                fill="none"
              />
              <path d={fillPath} fill="rgba(0,212,200,0.08)" stroke="none" />
              <path
                d={linePath}
                fill="none"
                stroke="#00d4c8"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 5px rgba(0,212,200,0.4))" }}
              />
              <circle
                cx={lastPoint[0]}
                cy={lastPoint[1]}
                r="3"
                fill="#00d4c8"
                style={{ filter: "drop-shadow(0 0 6px rgba(0,212,200,0.8))" }}
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border border border-border rounded-xl overflow-hidden">
            <MetricCell label="Hook strength" value={metrics.hook} unit="first 3s" tone={done ? "good" : undefined} />
            <MetricCell label="Emotional peaks" value={metrics.peaks} unit="detected" tone={done ? "good" : undefined} />
            <MetricCell label="Drop-off risk" value={metrics.drop} unit="highest at" tone={done ? "alert" : undefined} />
            <MetricCell label="Predicted retention" value={metrics.retention} unit="avg. watch" />
          </div>

          <div
            ref={logFeedRef}
            className="flex-1 font-mono text-[0.78rem] text-muted-foreground flex flex-col gap-[0.45rem] min-h-[80px] py-1 overflow-y-auto"
          >
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex gap-[0.6rem] animate-[log-in_0.5s_ease-out_forwards] ${
                  log.type === "flag"
                    ? "[&_.msg]:text-alert"
                    : log.type === "good"
                    ? "[&_.msg]:text-primary"
                    : ""
                }`}
              >
                <span className="text-border flex-shrink-0">{log.ts}</span>
                <span className="msg">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {done && (
        <div className="mt-6 flex items-start justify-between gap-8 flex-wrap pt-6 border-t border-white/[0.06] animate-[stage-in_0.6s_ease-out]">
          <p className="text-base max-w-[56ch]">
            Strong open — attention peaks in the first 3 seconds and holds
            through the first act.{" "}
            <span className="text-primary font-mono">Watch 0:46</span>:
            pacing flattens and focus is likely to drift. A tighter cut or a
            new beat there could lift retention by an estimated 8–12%. Your
            post timing is slightly outside the peak window — consider
            scheduling 30 minutes earlier.
          </p>
          <div className="flex items-center gap-8 flex-wrap">
            <button
              type="button"
              onClick={onRescan}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-mono font-bold text-sm tracking-wide uppercase px-7 py-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.25)]"
            >
              Scan another
            </button>
            <a
              href="#signals"
              className="inline-flex items-center gap-2 font-mono text-sm tracking-wide uppercase text-muted-foreground hover:text-primary transition-colors group"
            >
              <span>Full signal breakdown</span>
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                className="transition-transform group-hover:translate-x-1"
              >
                <path
                  d="M1 5H13M13 5L9 1M13 5L9 9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCell({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone?: "good" | "alert";
}) {
  return (
    <div className="bg-background px-4 py-[0.9rem] flex flex-col gap-1.5">
      <span className="font-mono text-[0.68rem] tracking-[0.12em] uppercase text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-display text-2xl font-semibold transition-colors ${
          tone === "good"
            ? "text-primary"
            : tone === "alert"
            ? "text-alert"
            : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="font-mono text-[0.68rem] text-border">{unit}</span>
    </div>
  );
}
