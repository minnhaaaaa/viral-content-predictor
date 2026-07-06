"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { FluidDropdown } from "@/components/ui/fluid-dropdown";
import { CATEGORY_OPTIONS, AnalysisFormData } from "./types";

interface Props { data: AnalysisFormData; update: (p: Partial<AnalysisFormData>) => void; onBack: () => void; onSubmit: () => void; }

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <label className="font-mono text-xs tracking-[0.12em] uppercase text-stone">{label}</label>
      {children}
      {hint && <span className="font-mono text-[0.7rem] text-ash">{hint}</span>}
    </div>
  );
}

const NavBtn = ({ onClick, children, primary }: { onClick: () => void; children: React.ReactNode; primary?: boolean }) => (
  <button type="button" onClick={onClick}
    className="inline-flex items-center gap-2 rounded-full text-[16px] font-semibold px-7 py-3 transition-all"
    style={primary
      ? { background: "#003566", color: "#fff", boxShadow: "rgba(0,0,0,0.2) 0px 1px 4px 0px", letterSpacing: "0.015em" }
      : { background: "transparent", color: "#4a5b73", border: "1px solid #e0e8f2", letterSpacing: "0.015em" }
    }
  >{children}</button>
);

export function ContextPanel({ data, update, onBack, onSubmit }: Props) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Field label="Content keywords" hint="Separate with commas — used to pull Google Trends slope" full>
          <Input type="text" placeholder="e.g. gym motivation, HIIT workout, fitness tips" value={data.contentKeywords} onChange={e => update({ contentKeywords: e.target.value })} />
        </Field>
        <Field label="Content category">
          <FluidDropdown options={CATEGORY_OPTIONS} placeholder="Select a category" value={data.contentCategory} onChange={v => update({ contentCategory: v })} />
        </Field>
        <Field label="Audio track name (optional)" hint="Trending audio boosts distribution on TikTok & Reels">
          <Input type="text" placeholder="e.g. Flowers — Miley Cyrus" value={data.audioTrack} onChange={e => update({ audioTrack: e.target.value })} />
        </Field>
        <Field label="Target audience location">
          <Input type="text" placeholder="e.g. United States, UK, India" value={data.audienceLocation} onChange={e => update({ audienceLocation: e.target.value })} />
        </Field>
        <Field label="Intended posting time" hint="Best windows: 6–9 am or 7–10 pm local">
          <Input type="time" value={data.postTime} onChange={e => update({ postTime: e.target.value })} />
        </Field>
      </div>
      <div className="flex items-center justify-end gap-4 mt-6">
        <NavBtn onClick={onBack}>← Back</NavBtn>
        <NavBtn onClick={onSubmit} primary>Run scan →</NavBtn>
      </div>
    </div>
  );
}
