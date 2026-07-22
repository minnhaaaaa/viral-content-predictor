import React from "react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-black border-t border-graphite-hairline">
      <div className="max-w-page mx-auto px-6 md:px-14 py-10">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <span className="font-body font-semibold text-body text-white">
            Xenrex<span className="text-iris-violet">AI</span>
          </span>
          {/* Resend Footer Link Row — minimal, two links, no columns */}
          <nav className="flex gap-6 font-body text-body-sm text-ash-gray">
            <Link href="#signals" className="hover:text-white transition-colors duration-150 ease-out">Signals</Link>
            <Link href="#upload"  className="hover:text-white transition-colors duration-150 ease-out">Scan a video</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
