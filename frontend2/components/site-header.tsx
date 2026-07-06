"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 backdrop-blur-xl",
        scrolled ? "bg-white/95 border-mist shadow-sm" : "bg-white/70 border-transparent"
      )}
    >
      <div className="max-w-page mx-auto flex items-center justify-between gap-8 px-6 md:px-14 py-4">
        <Link href="#top" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="XenrexAI logo" width={30} height={30} className="object-contain" />
          <span className="font-display font-bold text-xl tracking-tight text-ink">
            Xenrex<span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-9 font-body text-[16px] text-ink" style={{ letterSpacing: "0.015em" }}>
          <Link href="#signals" className="hover:text-primary transition-colors">Signals</Link>
          <Link href="#upload"  className="hover:text-primary transition-colors">Analyse a video</Link>
        </nav>

        <Link
          href="#upload"
          className="hidden sm:inline-flex items-center gap-2 rounded-full text-[16px] font-semibold px-6 py-3 bg-primary text-white transition-all hover:bg-[#004a8f] shadow-btn"
          style={{ letterSpacing: "0.015em" }}
        >
          Analyse a video
        </Link>
      </div>
    </header>
  );
}
