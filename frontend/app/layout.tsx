import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XenrexAI — Analyse your video, the way a neuroscientist would",
  description:
    "XenrexAI analyses your video the same way a neuroscientist would — mapping attention, arousal, and hook strength frame by frame, before you ever hit publish.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/*
          Resend's reference type system uses Domaine (hero serif),
          aBC Favorit (headings), Commit Mono (code), and Inter (body) —
          all licensed/custom fonts. Substitutes per the style guide:
          Domaine -> Playfair Display, aBC Favorit -> Inter (tight tracking),
          Commit Mono -> JetBrains Mono, Inter -> Inter (exact match).
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-background text-foreground antialiased overflow-x-hidden"
        style={{
          // @ts-expect-error -- CSS custom properties
          "--font-inter": "'Inter', ui-sans-serif, system-ui, sans-serif",
          "--font-domaine": "'Playfair Display', Georgia, serif",
          "--font-abc-favorit": "'Inter', ui-sans-serif, system-ui, sans-serif",
          "--font-commit-mono": "'JetBrains Mono', ui-monospace, monospace",
        }}
      >
        {children}
      </body>
    </html>
  );
}
