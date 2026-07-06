/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0a1628",
        border:     "#e0e8f2",
        primary: {
          DEFAULT:    "#003566",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT:    "#f7fafd",
          foreground: "#4a5b73",
        },
        card: {
          DEFAULT:    "#ffffff",
          foreground: "#0a1628",
        },
        alert: "#c8492e",
        ink:       "#0a1628",
        stone:     "#4a5b73",
        driftwood: "#7c8ba1",
        ash:       "#a3b1c2",
        mist:      "#e0e8f2",
        bone:      "#c7d3e2",
      },
      fontFamily: {
        display: ["Space Grotesk", "Helvetica Neue", "Arial", "sans-serif"],
        body:    ["PT Serif", "Georgia", "serif"],
        mono:    ["Fragment Mono", "SF Mono", "monospace"],
      },
      borderRadius: {
        lg:    "16px",  /* DESIGN.MD: inputs, buttons */
        xl:    "16px",
        "2xl": "20px",  /* DESIGN.MD: cards */
        "3xl": "20px",
        full:  "999px", /* DESIGN.MD: tags */
      },
      boxShadow: {
        card:    "rgba(0,53,102,0.14) 6px 4px 24px 0px",
        "card-hover": "rgba(0,53,102,0.22) 6px 6px 28px 0px",
        btn:     "rgba(0,0,0,0.2) 0px 1px 4px 0px",
      },
      spacing: {
        4:"4px",5:"5px",7:"7px",10:"10px",14:"14px",15:"15px",16:"16px",
        20:"20px",22:"22px",25:"25px",30:"30px",35:"35px",40:"40px",
        50:"50px",100:"100px",113:"113px",
      },
      maxWidth: { page: "1200px" },
      keyframes: {
        "logo-float": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      animation: { "logo-float": "logo-float 5s ease-in-out infinite" },
    },
  },
  plugins: [],
};
