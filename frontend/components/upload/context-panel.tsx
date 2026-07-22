"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { FluidDropdown } from "@/components/ui/fluid-dropdown";
import { LocationAutocomplete } from "./location-autocomplete";
import { CATEGORY_OPTIONS, AnalysisFormData } from "./types";

interface Props { data: AnalysisFormData; update: (p: Partial<AnalysisFormData>) => void; onBack: () => void; onSubmit: () => void; }

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <label className="font-mono text-caption tracking-[0.12em] uppercase text-ash-gray">{label}</label>
      {children}
      {hint && <span className="font-body text-caption text-charcoal">{hint}</span>}
    </div>
  );
}

const NavBtn = ({ onClick, children, primary, disabled }: { onClick: () => void; children: React.ReactNode; primary?: boolean; disabled?: boolean }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    className={`inline-flex items-center gap-2 rounded-button font-body text-body-sm px-5 py-3 transition-colors duration-150 ease-out disabled:opacity-40 disabled:cursor-not-allowed ${
      primary
        ? "bg-signal-blue text-black font-medium hover:bg-sky-blue"
        : "bg-transparent text-ash-gray border border-graphite-hairline hover:border-white hover:text-white"
    }`}
  >{children}</button>
);

export function ContextPanel({ data, update, onBack, onSubmit }: Props) {
  const canSubmit = !!data.location;

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
        <Field label="Target audience city" hint="We need a specific city, not just a country — posting time windows are timezone-aware" full>
          <LocationAutocomplete value={data.location} onChange={loc => update({ location: loc })} />
        </Field>
        <Field label="Intended posting time" hint="Best windows: 6–9 am or 7–10 pm local">
          <Input type="time" value={data.postTime} onChange={e => update({ postTime: e.target.value })} />
        </Field>
      </div>
      <div className="flex items-center justify-end gap-4 mt-6">
        <NavBtn onClick={onBack}>← Back</NavBtn>
        <NavBtn onClick={onSubmit} primary disabled={!canSubmit}>Run scan →</NavBtn>
      </div>
      {!canSubmit && (
        <p className="text-right font-body text-caption text-charcoal mt-2">
          Select a city from the dropdown to continue
        </p>
      )}
    </div>
  );
}
