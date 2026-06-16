import React from "react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-14 py-12 md:py-10">
        <div className="flex justify-between items-center flex-wrap gap-6 pb-8 border-b border-white/[0.06]">
          <span className="font-display font-bold text-xl">
            Xenrex<span className="text-primary">AI</span>
          </span>
          <nav className="flex gap-6 md:gap-8 font-mono text-sm flex-wrap">
            <Link href="#how" className="text-muted-foreground hover:text-primary transition-colors">
              How it reads
            </Link>
            <Link href="#signals" className="text-muted-foreground hover:text-primary transition-colors">
              Signals
            </Link>
            <Link href="#upload" className="text-muted-foreground hover:text-primary transition-colors">
              Scan a video
            </Link>
          </nav>
        </div>
        <div className="flex justify-between items-center pt-6 font-mono text-xs text-border tracking-wide flex-wrap gap-4">
          <span>© 2026 XenrexAI</span>
          <span className="uppercase">Analyse before you publish</span>
        </div>
      </div>
    </footer>
  );
}
