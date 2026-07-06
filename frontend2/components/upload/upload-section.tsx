"use client";

import React, { useState } from "react";
import { TextReveal } from "@/components/ui/text-reveal";
import { Dropzone } from "./dropzone";
import { AccountPanel } from "./account-panel";
import { ContextPanel } from "./context-panel";
import { AnalysisStage } from "./analysis-stage";
import { AnalysisFormData } from "./types";

const STEPS = ["01 — Upload", "02 — Account", "03 — Context"];

const initialFormData: AnalysisFormData = {
  followerCount: "", daysSinceUpload: "", avgViews: "",
  platform: null, contentKeywords: "", contentCategory: null,
  audioTrack: "", audienceLocation: "", postTime: "",
};

export function UploadSection() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState<AnalysisFormData>(initialFormData);

  function update(patch: Partial<AnalysisFormData>) {
    setFormData(prev => ({ ...prev, ...patch }));
  }
  function handleFile(f: File) { setFile(f); setStep(1); }
  function handleSubmit()      { setAnalyzing(true); }
  function handleRescan() {
    setAnalyzing(false); setFile(null);
    setStep(0); setFormData(initialFormData);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById("upload");
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
      });
    });
  }

  return (
    <section id="upload" className="bg-white border-t border-mist">
      <div className="max-w-page mx-auto w-full px-6 md:px-14 py-20 md:py-28">
        <div className="max-w-[640px] mb-10">
          <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase text-primary mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
            Scan your video
          </p>
          <TextReveal
            as="h2"
            lines={["Drop your edit.", "XenrexAI reads it immediately."]}
            className="font-display font-semibold text-[2rem] md:text-[3.4rem] leading-[1.1] text-ink"
          />
          <p className="mt-5 text-stone text-base max-w-[40ch]">
            MP4 or MOV up to 60 seconds. Your video plays back while the model maps every second beneath it.
          </p>
        </div>

        {!analyzing && (
          <div className="flex rounded-2xl overflow-hidden max-w-[540px] mb-8 border border-mist bg-white shadow-sm">
            {STEPS.map((label, i) => (
              <button key={label} type="button"
                onClick={() => { if (i === 0 || file) setStep(i); }}
                className="flex-1 px-4 py-3 font-mono text-xs tracking-[0.1em] uppercase text-center transition-colors border-r border-mist last:border-r-0"
                style={{
                  background: step === i ? "rgba(0,53,102,0.06)" : "transparent",
                  color: step === i ? "#003566" : step > i ? "rgba(0,53,102,0.4)" : "#a3b1c2",
                }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {analyzing && file ? (
          <AnalysisStage file={file} formData={formData} onRescan={handleRescan} />
        ) : (
          <>
            {step === 0 && <Dropzone onFile={handleFile} />}
            {step === 1 && <AccountPanel data={formData} update={update} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
            {step === 2 && <ContextPanel data={formData} update={update} onBack={() => setStep(1)} onSubmit={handleSubmit} />}
          </>
        )}
      </div>
    </section>
  );
}
