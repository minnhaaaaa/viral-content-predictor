"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export function Dropzone({ onFile }: { onFile: (file: File) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("video/")) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a video file to analyse"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={handleDrop}
      className={`group relative border border-dashed rounded-[18px] min-h-[240px] flex items-center justify-center cursor-pointer
        transition-colors duration-300 px-8 py-12 md:py-20
        bg-gradient-to-b from-primary/[0.02] to-transparent
        ${dragActive ? "border-primary bg-primary/[0.05]" : "border-border hover:border-primary"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={handleChange}
      />
      <div className="text-center max-w-[360px]">
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex text-primary mb-5"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 26V8M20 8L13 15M20 8L27 15"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 30V32C6 33.1 6.9 34 8 34H32C33.1 34 34 33.1 34 32V30"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
        <p className="font-display text-lg font-semibold mb-1.5">
          Drag a video here, or click to browse
        </p>
        <p className="font-mono text-xs tracking-wide text-muted-foreground">
          MP4 or MOV · up to 60 seconds · short-form content
        </p>
      </div>

      {/* corner accents */}
      {[
        "top-[-1px] left-[-1px] border-r-0 border-b-0 rounded-tl-[18px]",
        "top-[-1px] right-[-1px] border-l-0 border-b-0 rounded-tr-[18px]",
        "bottom-[-1px] left-[-1px] border-r-0 border-t-0 rounded-bl-[18px]",
        "bottom-[-1px] right-[-1px] border-l-0 border-t-0 rounded-br-[18px]",
      ].map((pos, i) => (
        <span
          key={i}
          className={`absolute w-[18px] h-[18px] border border-primary transition-opacity duration-300 ${pos} ${
            dragActive ? "opacity-70" : "opacity-0 group-hover:opacity-70"
          }`}
        />
      ))}
    </div>
  );
}
