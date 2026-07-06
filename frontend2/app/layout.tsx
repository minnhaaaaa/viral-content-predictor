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
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fragment+Mono:ital@0;1&family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
