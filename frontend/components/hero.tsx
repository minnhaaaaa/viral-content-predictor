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
    <section
      id="top"
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-6 px-5"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/logo.png"
              alt="XenrexAI logo"
              width={140}
              height={140}
              className="object-contain w-[90px] md:w-[140px] h-auto drop-shadow-[0_0_32px_rgba(0,212,200,0.3)]"
              priority
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-extrabold leading-none tracking-tight text-[3.5rem] md:text-[8rem] flex"
          >
            <TextScramble
              as="span"
              duration={0.9}
              speed={0.045}
              trigger={true}
              className="text-foreground"
            >
              Xenrex
            </TextScramble>
            <TextScramble
              as="span"
              duration={0.9}
              speed={0.045}
              trigger={true}
              className="text-primary"
            >
              AI
            </TextScramble>
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <TextTypewriter
            as="p"
            speed={0.03}
            startDelay={1.0}
            trigger={true}
            className="font-mono text-xs md:text-sm tracking-[0.22em] uppercase text-muted-foreground max-w-[42ch] inline-block"
          >
            Analyse your video, the same way a neuroscientist would.
          </TextTypewriter>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-5 flex-wrap justify-center mt-2"
        >
          <Link
            href="#upload"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-mono font-bold text-sm tracking-wide uppercase px-7 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.25)]"
          >
            Scan my video
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center gap-2 font-mono text-sm tracking-wide uppercase text-muted-foreground hover:text-primary transition-colors group"
          >
            <span>See how it reads</span>
            <svg
              width="14"
              height="10"
              viewBox="0 0 14 10"
              fill="none"
              className="transition-transform group-hover:translate-x-1"
            >
              <path
                d="M1 5H13M13 5L9 1M13 5L9 9"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </motion.div>
      </motion.div>

      <HeroReadout />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[0.65rem] tracking-[0.2em] uppercase text-border"
      >
        <span className="w-px h-9 bg-gradient-to-b from-primary to-transparent animate-pulse" />
        <span>Scroll</span>
      </motion.div>
    </section>
  );
}
