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
        "fixed top-0 left-0 right-0 z-[100] border-b transition-colors duration-150 ease-out backdrop-blur-xl",
        scrolled ? "bg-black/90 border-graphite-hairline" : "bg-black/60 border-transparent"
      )}
    >
      <div className="max-w-page mx-auto flex items-center justify-between gap-8 px-6 md:px-14 py-4">
        <Link href="#top" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="XenrexAI logo" width={26} height={26} className="object-contain" />
          <span className="font-body font-semibold text-lg tracking-tight text-white">
            Xenrex<span className="text-iris-violet">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-8 font-body text-body-sm text-bone-white">
          <Link href="#signals" className="hover:text-white transition-colors duration-150 ease-out">Signals</Link>
          <Link href="#upload"  className="hover:text-white transition-colors duration-150 ease-out">Analyse a video</Link>
        </nav>

        {/* Resend "Ghost on Black" primary button — never filled */}
        <Link
          href="#upload"
          className="hidden sm:inline-flex items-center gap-2 rounded-button border border-graphite-hairline px-4 py-3 text-body-sm text-white transition-colors duration-150 ease-out hover:border-white"
        >
          Analyse a video
        </Link>
      </div>
    </header>
  );
}
