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
  audioTrack: "", location: null, postTime: "",
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
    <section id="upload" className="bg-black border-t border-graphite-hairline">
      <div className="max-w-page mx-auto w-full px-6 md:px-14 py-20 md:py-28">
        <div className="max-w-[640px] mb-10">
          <p className="inline-flex items-center gap-2 font-mono text-caption tracking-[0.18em] uppercase text-ash-gray mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-iris-violet animate-pulse-dot" />
            Scan your video
          </p>
          <TextReveal
            as="h2"
            lines={["Drop your edit.", "XenrexAI reads it immediately."]}
            className="font-heading font-normal text-[2rem] md:text-heading leading-[1.1] tracking-tight text-white"
          />
          <p className="mt-5 text-ash-gray text-body max-w-[40ch]">
            MP4 or MOV up to 60 seconds. Your video plays back while the model maps every second beneath it.
          </p>
        </div>

        {!analyzing && (
          <div className="flex rounded-card overflow-hidden max-w-[540px] mb-8 border border-graphite-hairline bg-black">
            {STEPS.map((label, i) => (
              <button key={label} type="button"
                onClick={() => { if (i === 0 || file) setStep(i); }}
                className="flex-1 px-4 py-3 font-mono text-caption tracking-[0.1em] uppercase text-center transition-colors duration-150 ease-out border-r border-graphite-hairline last:border-r-0"
                style={{
                  color: step === i ? "#9281f7" : step > i ? "#6e727a" : "#464a4d",
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
