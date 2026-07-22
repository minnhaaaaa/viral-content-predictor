"use client";

import React, { useRef, useState } from "react";

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
      role="button" tabIndex={0}
      aria-label="Upload a video file to analyse"
      onClick={() => inputRef.current?.click()}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
      onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
      onDragOver={e => e.preventDefault()}
      onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
      onDrop={handleDrop}
      className={`group relative rounded-card min-h-[240px] flex items-center justify-center cursor-pointer px-8 py-16 bg-black transition-colors duration-150 ease-out border ${
        dragActive ? "border-white" : "border-graphite-hairline hover:border-iron"
      }`}
      style={{ borderStyle: "dashed" }}
    >
      <input ref={inputRef} type="file" accept="video/*" hidden onChange={handleChange} />
      <div className="text-center max-w-[360px]">
        <div className="inline-flex mb-5 text-ash-gray">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <path d="M20 26V8M20 8L13 15M20 8L27 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 30V32C6 33.1 6.9 34 8 34H32C33.1 34 34 33.1 34 32V30" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="font-body text-body font-medium mb-1.5 text-white">Drag a video here, or click to browse</p>
        <p className="font-mono text-caption tracking-wide text-charcoal">MP4 or MOV · up to 60 seconds · short-form content</p>
      </div>
    </div>
  );
}
