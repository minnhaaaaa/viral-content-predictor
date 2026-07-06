"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { FluidDropdown } from "@/components/ui/fluid-dropdown";
import { PLATFORM_OPTIONS, AnalysisFormData } from "./types";

interface Props { data: AnalysisFormData; update: (p: Partial<AnalysisFormData>) => void; onBack: () => void; onNext: () => void; }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
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

export function AccountPanel({ data, update, onBack, onNext }: Props) {
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
        <NavBtn onClick={onNext} primary>Continue →</NavBtn>
      </div>
    </div>
  );
}
