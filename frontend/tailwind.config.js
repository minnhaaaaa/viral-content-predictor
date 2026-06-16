/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020f1e",
        foreground: "#e8f4f8",
        border: "#0a3a5a",
        muted: {
          DEFAULT: "#041830",
          foreground: "#7aa8c0",
        },
        primary: {
          DEFAULT: "#00d4c8",
          foreground: "#020f1e",
        },
        secondary: {
          DEFAULT: "#052240",
          foreground: "#e8f4f8",
        },
        card: {
          DEFAULT: "#052240",
          foreground: "#e8f4f8",
        },
        alert: "#ff6b47",
        xenrex: {
          navy: "#052b56",
          "navy-2": "#052f5f",
          "deep-blue": "#001d3d",
          yale: "#03416b",
          "yale-2": "#005377",
          teal: "#026879",
          "teal-2": "#036e7a",
          "teal-3": "#03737a",
          signal: "#00d4c8",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Helvetica Neue", "Arial", "sans-serif"],
        body: ["PT Serif", "Georgia", "serif"],
        mono: ["Fragment Mono", "SF Mono", "monospace"],
      },
      borderRadius: {
        lg: "12px",
        xl: "18px",
        "2xl": "24px",
      },
      keyframes: {
        "logo-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-dot": {
          "0%": { boxShadow: "0 0 0 0 rgba(0,212,200,0.55)" },
          "70%": { boxShadow: "0 0 0 7px rgba(0,212,200,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(0,212,200,0)" },
        },
        "scan-move": {
          "0%": { top: "0%", opacity: "0" },
          "10%": { opacity: "0.7" },
          "50%": { top: "100%", opacity: "0.7" },
          "60%": { opacity: "0" },
          "100%": { top: "0%", opacity: "0" },
        },
      },
      animation: {
        "logo-float": "logo-float 5s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
        "scan-move": "scan-move 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
