"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { FluidDropdown } from "@/components/ui/fluid-dropdown";
import { PLATFORM_OPTIONS, AnalysisFormData } from "./types";

interface AccountPanelProps {
  data: AnalysisFormData;
  update: (patch: Partial<AnalysisFormData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function AccountPanel({ data, update, onBack, onNext }: AccountPanelProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Field
          label="Follower count"
          hint="Accounts with fewer than 1,000 followers score lower"
        >
          <Input
            type="number"
            placeholder="e.g. 24500"
            min={0}
            value={data.followerCount}
            onChange={(e) => update({ followerCount: e.target.value })}
          />
        </Field>

        <Field
          label="Days since last upload"
          hint="Consistent posting boosts algorithm reach"
        >
          <Input
            type="number"
            placeholder="e.g. 3"
            min={0}
            value={data.daysSinceUpload}
            onChange={(e) => update({ daysSinceUpload: e.target.value })}
          />
        </Field>

        <Field
          label="Avg. views (last 10 videos)"
          hint="Algorithm favours avg. views above 1% of followers"
        >
          <Input
            type="number"
            placeholder="e.g. 8200"
            min={0}
            value={data.avgViews}
            onChange={(e) => update({ avgViews: e.target.value })}
          />
        </Field>

        <Field label="Platform">
          <FluidDropdown
            options={PLATFORM_OPTIONS}
            placeholder="Select a platform"
            value={data.platform}
            onChange={(v) => update({ platform: v })}
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full font-mono text-sm tracking-wide uppercase px-7 py-3 border border-border text-foreground transition-all hover:border-primary hover:text-primary"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-mono font-bold text-sm tracking-wide uppercase px-7 py-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.25)]"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-xs tracking-[0.12em] uppercase text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && (
        <span className="font-mono text-[0.7rem] text-border tracking-wide">
          {hint}
        </span>
      )}
    </div>
  );
}
