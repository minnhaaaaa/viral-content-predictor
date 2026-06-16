"use client";

import React, { useRef, useId } from "react"; // 👈 Imported useId
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame,
} from "framer-motion";
import { cn } from "@/lib/utils";

export const InfiniteGrid = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseId = useId(); 
  const gridPatternId = `grid-pattern-${baseId}`; 

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const speedX = 0.12;
  const speedY = 0.12;

  useAnimationFrame(() => {
    gridOffsetX.set((gridOffsetX.get() + speedX) % 40);
    gridOffsetY.set((gridOffsetY.get() + speedY) % 40);
  });

  const maskImage = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "fixed inset-0 z-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      {/* patternId prop to pass down the unique identifier */}
      <div className="absolute inset-0 opacity-[0.045] text-primary">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} patternId={gridPatternId} />
      </div>
      <motion.div
        className="absolute inset-0 opacity-40 text-primary"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} patternId={gridPatternId} />
      </motion.div>

      {/* ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% -5%, rgba(3,125,122,0.15) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

const GridPattern = ({
  offsetX,
  offsetY,
  patternId, 
}: {
  offsetX: any;
  offsetY: any;
  patternId: string;
}) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id={patternId} 
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} /> 
    </svg>
  );
};