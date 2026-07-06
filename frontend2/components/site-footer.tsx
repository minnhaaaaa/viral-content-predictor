import React from "react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-mist">
      <div className="max-w-page mx-auto px-6 md:px-14 py-12">
        <div className="flex justify-between items-center flex-wrap gap-6 pb-8 border-b border-mist">
          <span className="font-display font-bold text-xl text-ink">
            Xenrex<span className="text-primary">AI</span>
          </span>
          <nav className="flex gap-6 md:gap-8 font-mono text-sm flex-wrap">
            <Link href="#signals" className="text-stone hover:text-primary transition-colors">Signals</Link>
            <Link href="#upload"  className="text-stone hover:text-primary transition-colors">Scan a video</Link>
          </nav>
        </div>
        <div className="flex justify-between items-center pt-6 font-mono text-xs text-ash tracking-wide flex-wrap gap-4">
          <span>© 2026 XenrexAI</span>
          <span className="uppercase">Analyse before you publish</span>
        </div>
      </div>
    </footer>
  );
}
