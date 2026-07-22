"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { FluidDropdown } from "@/components/ui/fluid-dropdown";
import { PLATFORM_OPTIONS, AnalysisFormData } from "./types";

interface Props { data: AnalysisFormData; update: (p: Partial<AnalysisFormData>) => void; onBack: () => void; onNext: () => void; }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
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

export function AccountPanel({ data, update, onBack, onNext }: Props) {
  const canContinue =
    data.followerCount.trim() !== "" &&
    data.daysSinceUpload.trim() !== "" &&
    data.avgViews.trim() !== "" &&
    !!data.platform;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Field label="Follower count" hint="Accounts with fewer than 1,000 followers score lower">
          <Input type="number" placeholder="e.g. 24500" min={0} value={data.followerCount} onChange={e => update({ followerCount: e.target.value })} />
        </Field>
        <Field label="Days since last upload" hint="Consistent posting boosts algorithm reach">
          <Input type="number" placeholder="e.g. 3" min={0} value={data.daysSinceUpload} onChange={e => update({ daysSinceUpload: e.target.value })} />
        </Field>
        <Field label="Avg. views (last 10 videos)" hint="Algorithm favours avg. views above 1% of followers">
          <Input type="number" placeholder="e.g. 8200" min={0} value={data.avgViews} onChange={e => update({ avgViews: e.target.value })} />
        </Field>
        <Field label="Platform">
          <FluidDropdown options={PLATFORM_OPTIONS} placeholder="Select a platform" value={data.platform} onChange={v => update({ platform: v })} />
        </Field>
      </div>
      <div className="flex items-center justify-end gap-4 mt-6">
        <NavBtn onClick={onBack}>← Back</NavBtn>
        <NavBtn onClick={onNext} primary disabled={!canContinue}>Continue →</NavBtn>
      </div>
      {!canContinue && (
        <p className="text-right font-body text-caption text-charcoal mt-2">
          Fill in all fields to continue
        </p>
      )}
    </div>
  );
}
