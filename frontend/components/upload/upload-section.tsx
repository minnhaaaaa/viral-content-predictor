"use client";

import React, { useState } from "react";
import { TextReveal, FadeReveal } from "@/components/ui/text-reveal";
import { Dropzone } from "./dropzone";
import { AccountPanel } from "./account-panel";
import { ContextPanel } from "./context-panel";
import { AnalysisStage } from "./analysis-stage";
import { AnalysisFormData } from "./types";

const STEPS = ["01 — Upload", "02 — Account", "03 — Context"];

const initialFormData: AnalysisFormData = {
  followerCount: "",
  daysSinceUpload: "",
  avgViews: "",
  platform: null,
  contentKeywords: "",
  contentCategory: null,
  audioTrack: "",
  audienceLocation: "",
  postTime: "",
};

export function UploadSection() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState<AnalysisFormData>(initialFormData);

  function update(patch: Partial<AnalysisFormData>) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  function handleFile(f: File) {
    setFile(f);
    setStep(1);
  }

  function handleSubmit() {
    setAnalyzing(true);
  }

  function handleRescan() {
    setAnalyzing(false);
    setFile(null);
    setStep(0);
    setFormData(initialFormData);
    // Use offsetTop so sticky/pinned sections above don't confuse scrollIntoView
    requestAnimationFrame(() => {
      const el = document.getElementById("upload");
      if (el) {
        window.scrollTo({ top: el.offsetTop, behavior: "smooth" });
      }
    });
  }

  return (
    <section
      id="upload"
      className="min-h-screen flex flex-col justify-center relative px-5 md:px-14 py-20 md:py-28 border-t border-white/[0.06]"
    >
      <div className="max-w-[1240px] mx-auto w-full">
        <div className="max-w-[640px] mb-10">
          <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-primary mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
            Scan your video
          </p>
          <TextReveal
            as="h2"
            lines={["Drop your edit.", "XenrexAI reads it immediately."]}
            className="font-display font-semibold text-[2rem] md:text-[3.4rem] leading-[1.1]"
          />
          <p className="mt-5 text-muted-foreground text-base max-w-[40ch]">
            MP4 or MOV up to 60 seconds. Your video plays back while the
            model maps every second beneath it.
          </p>
        </div>

        {!analyzing && (
          <div className="flex border border-border rounded-xl overflow-hidden bg-[#041830] max-w-[540px] mb-8">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (i === 0 || file) setStep(i);
                }}
                className={`flex-1 px-4 py-3 font-mono text-xs tracking-[0.1em] uppercase text-center transition-colors border-r border-border last:border-r-0
                  ${
                    step === i
                      ? "bg-primary/10 text-primary"
                      : step > i
                      ? "text-primary/50"
                      : "text-border"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {analyzing && file ? (
          <AnalysisStage file={file} onRescan={handleRescan} />
        ) : (
          <>
            {step === 0 && <Dropzone onFile={handleFile} />}
            {step === 1 && (
              <AccountPanel
                data={formData}
                update={update}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <ContextPanel
                data={formData}
                update={update}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
