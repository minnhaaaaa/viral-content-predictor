/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        border:     "#292d30",
        primary: {
          DEFAULT:    "#3b9eff",
          foreground: "#000000",
        },
        muted: {
          DEFAULT:    "#0b0e14",
          foreground: "#a1a4a5",
        },
        card: {
          DEFAULT:    "#000000",
          foreground: "#ffffff",
        },
        alert:     "#ff9592",
        signal:    "#9281f7",
        highlight: "#9281f7",

        // Resend token names, exposed directly for arbitrary-value-free usage
        "void-black":        "#000000",
        "graphite-hairline": "#292d30",
        "bone-white":        "#f0f0f0",
        "ash-gray":          "#a1a4a5",
        "smoke-gray":        "#abafb4",
        iron:                "#6e727a",
        charcoal:            "#464a4d",
        "iris-violet":       "#9281f7",
        "iris-violet-glow":  "#baa7ff",
        "signal-blue":       "#3b9eff",
        "sky-blue":          "#70b8ff",
        "pulse-green":       "#3ad389",
        "alarm-red":         "#ff9592",
        crimson:             "#ff6465",
        amber:               "#ffca16",
        "amber-glow":        "#ffd60a",
      },
      fontFamily: {
        display: ["var(--font-domaine)", "Georgia", "serif"],
        heading: ["var(--font-abc-favorit)", "Inter", "sans-serif"],
        body:    ["var(--font-inter)", "system-ui", "sans-serif"],
        mono:    ["var(--font-commit-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        caption:      ["12px", { lineHeight: "1.33" }],
        "body-sm":    ["14px", { lineHeight: "1.43" }],
        body:         ["16px", { lineHeight: "1.5" }],
        subheading:   ["20px", { lineHeight: "1" }],
        "heading-sm": ["24px", { lineHeight: "1.5" }],
        heading:      ["56px", { lineHeight: "1.2", letterSpacing: "-0.05em" }],
        "heading-lg": ["77px", { lineHeight: "1", letterSpacing: "-0.01em" }],
        display:      ["96px", { lineHeight: "1", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        DEFAULT: "6px",
        md:      "6px",
        lg:      "16px",
        xl:      "16px",
        "2xl":   "16px",
        "3xl":   "24px",
        badge:   "6px",
        input:   "6px",
        button:  "6px",
        card:    "16px",
        panel:   "24px",
      },
      boxShadow: {
        card:        "rgba(176, 199, 217, 0.145) 0px 0px 0px 1px",
        "card-hover":"rgba(176, 199, 217, 0.24) 0px 0px 0px 1px",
        btn:         "rgba(176, 199, 217, 0.145) 0px 0px 0px 1px",
        subtle:      "rgba(176, 199, 217, 0.145) 0px 0px 0px 1px",
      },
      spacing: {
        18: "72px",
      },
      maxWidth: { page: "1200px" },
      keyframes: {
        "logo-float": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      animation: { "logo-float": "logo-float 5s ease-in-out infinite" },
      transitionDuration: {
        150: "150ms",
      },
    },
  },
  plugins: [],
};
