"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InteractiveProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  logoUrl?: string;
  title: string;
  description: string;
  price?: string;
}

export function InteractiveProductCard({
  className,
  imageUrl,
  logoUrl,
  title,
  description,
  price,
  ...props
}: InteractiveProductCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = ((y - height / 2) / (height / 2)) * -7;
    const rotateY = ((x - width / 2) / (width / 2)) * 7;
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s ease-in-out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn(
        "relative w-full aspect-[9/12] rounded-3xl overflow-hidden shadow-xl card-7-3d cursor-default",
        className
      )}
      {...props}
    >
      {/* Background image */}
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "translateZ(-20px) scale(1.12)" }}
      />
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col" style={{ transform: "translateZ(40px)" }}>
        {/* Header */}
        <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
            <p className="text-xs text-white/60 mt-0.5">{description}</p>
          </div>
          {logoUrl && (
            <img src={logoUrl} alt="logo" className="h-4 w-auto object-contain ml-3 flex-shrink-0" />
          )}
        </div>

        {/* Price badge */}
        {price && (
          <div className="mt-3">
            <div className="inline-block rounded-full bg-black/40 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              {price}
            </div>
          </div>
        )}

        {/* Dots */}
        <div className="mt-auto flex w-full justify-center gap-2 pb-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cn("h-1.5 w-1.5 rounded-full", index === 0 ? "bg-white" : "bg-white/30")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
