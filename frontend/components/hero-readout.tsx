"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAnimationFrame } from "framer-motion";

const LABELS = ["62%", "74%", "88%", "91%", "79%", "68%", "55%", "83%"];

function genPath(seed: number, w = 1200, mid = 30, points = 24) {
  let d = `M0,${mid}`;
  for (let i = 1; i <= points; i++) {
    const x = (i / points) * w;
    const noise = Math.sin(i * 0.7 + seed) * 10 + Math.sin(i * 1.9 + seed * 1.3) * 4;
    d += ` L${x.toFixed(1)},${(mid + noise).toFixed(1)}`;
  }
  return d;
}

export function HeroReadout() {
  const [livePath, setLivePath] = useState(genPath(0));
  const [ghostPath] = useState(genPath(0.5));
  const [label, setLabel] = useState(LABELS[0]);
  const t = useRef(0);
  const labelIndex = useRef(0);

  useAnimationFrame(() => {
    t.current += 0.045;
    setLivePath(genPath(t.current));
  });

  useEffect(() => {
    const id = setInterval(() => {
      labelIndex.current = (labelIndex.current + 1) % LABELS.length;
      setLabel(LABELS[labelIndex.current]);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[3] pointer-events-none">
      <svg className="w-full h-[60px] block overflow-visible" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d={ghostPath} stroke="#292d30" strokeWidth="1" fill="none" />
        <path d={livePath} stroke="#9281f7" strokeWidth="1.2" fill="none" />
      </svg>
      <div className="flex justify-between items-center font-mono text-caption tracking-[0.16em] uppercase text-charcoal px-5 md:px-14 pb-6 max-w-page mx-auto">
        <span>Attention</span>
        <span className="text-iris-violet">{label}</span>
        <span>Live Scan</span>
      </div>
    </div>
  );
}
