"use client";

import { cn } from "@/lib/utils";

interface AnimatedCircularProgressBarProps {
  max?: number;
  value?: number;
  min?: number;
  gaugePrimaryColor: string;
  gaugeSecondaryColor: string;
  className?: string;
}

export function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
}: AnimatedCircularProgressBarProps) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const currentPercent = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={cn("relative size-40", className)}
      style={
        {
          "--circle-size": "100px",
          "--circumference": circumference,
          "--percent-to-px": `${percentPx}px`,
          "--gap-percent": "5",
          "--offset-factor": "0",
          "--transition-length": "1s",
          "--transition-step": "200ms",
          "--delay": "0s",
          "--percent-to-deg": "3.6deg",
          transform: "translateZ(0)",
        } as React.CSSProperties
      }
    >
      <svg
        viewBox="0 0 100 100"
        className="size-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={gaugeSecondaryColor}
          strokeWidth="10"
          strokeDasharray={`${circumference * (1 - 0.05)} ${circumference * 0.05}`}
          strokeLinecap="round"
        />
        {/* Animated progress arc */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={gaugePrimaryColor}
          strokeWidth="10"
          strokeDasharray={`${circumference * ((currentPercent / 100) * (1 - 0.05))} ${circumference}`}
          strokeLinecap="round"
          style={{
            transition: `stroke-dasharray ${1}s ease`,
            filter: `drop-shadow(0 0 8px ${gaugePrimaryColor}80)`,
          }}
        />
      </svg>
    </div>
  );
}
