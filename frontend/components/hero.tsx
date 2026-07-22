"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeroReadout } from "@/components/hero-readout";
import { TextScramble } from "@/components/ui/text-scramble";
import { TextTypewriter } from "@/components/ui/text-typewriter";

export function Hero() {
  return (
    <section id="top" className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-black">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-7 px-5"
      >
        {/* Hero announcement pill — Resend spec: transparent, 1px hairline, pill radius */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 rounded-full border border-graphite-hairline px-3 py-1.5 font-body text-body-sm text-bone-white"
        >
          <Image src="/logo.png" alt="" width={16} height={16} className="object-contain" />
          <span>Pre-publish attention modelling</span>
        </motion.div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-display font-normal leading-none tracking-tight text-[3.2rem] md:text-display flex">
            <TextScramble as="span" duration={0.9} speed={0.045} trigger={true} className="text-white">
              Xenrex
            </TextScramble>
            <TextScramble as="span" duration={0.9} speed={0.045} trigger={true} className="text-iris-violet">
              AI
            </TextScramble>
          </h1>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <TextTypewriter
            as="p" speed={0.025} startDelay={0.6} trigger={true}
            className="font-body text-body md:text-subheading text-ash-gray max-w-[42ch] inline-block"
          >
            Analyse your video, the same way a neuroscientist would.
          </TextTypewriter>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-4 flex-wrap justify-center mt-3"
        >
          {/* Primary CTA — Resend's ghost button, never filled */}
          <Link
            href="#upload"
            className="inline-flex items-center gap-2 rounded-button border border-graphite-hairline px-4 py-3 text-body-sm text-white transition-colors duration-150 ease-out hover:border-white"
          >
            Scan my video
          </Link>
          {/* Text link with chevron */}
          <Link
            href="#signals"
            className="inline-flex items-center gap-2 text-body-sm text-bone-white hover:text-white transition-colors duration-150 ease-out group"
          >
            <span>See what it measures</span>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" className="transition-transform duration-150 group-hover:translate-x-1">
              <path d="M1 5H13M13 5L9 1M13 5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </motion.div>
      </motion.div>

      <HeroReadout />
    </section>
  );
}
