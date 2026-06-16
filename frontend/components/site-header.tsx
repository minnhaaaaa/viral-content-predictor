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
        "fixed top-0 left-0 right-0 z-[100] border-b transition-colors duration-300 backdrop-blur-xl",
        scrolled
          ? "bg-background/90 border-border/60"
          : "bg-background/50 border-transparent"
      )}
    >
      <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-8 px-5 md:px-14 py-3.5">
        <Link href="#top" className="flex items-center gap-2.5 text-foreground">
          <Image
            src="/logo.png"
            alt="XenrexAI logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="font-display font-bold text-xl tracking-tight">
            Xenrex<span className="text-primary">AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex gap-9 font-mono text-sm text-muted-foreground">
          <Link href="#how" className="hover:text-foreground transition-colors">
            How it reads
          </Link>
          <Link href="#signals" className="hover:text-foreground transition-colors">
            Signals
          </Link>
          <Link href="#upload" className="hover:text-foreground transition-colors">
            Analyse a video
          </Link>
        </nav>
        <Link
          href="#upload"
          className="hidden sm:inline-flex items-center gap-2 rounded-full font-mono text-sm tracking-wide uppercase px-7 py-3 border border-border text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
        >
          Analyse a video
        </Link>
      </div>
    </header>
  );
}
