/**
 * Tailwind config for the self-contained "Phunny Tools" app under src/ut.
 *
 * This is intentionally separate from the repository's root tailwind.config.js
 * so the src/ut build can evolve independently. It is wired up via the
 * `@config` directive at the top of src/ut/index.css.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  darkMode: "class",
  content: ["./index.ut.html", "./src/ut/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        cream: {
          DEFAULT: "#F7F4EC",
          deep: "#EDE7D9",
        },
        ink: {
          DEFAULT: "#14110F",
          soft: "#3A342E",
          night: "#100E0D",
        },
        zing: {
          orange: "#FF5A1F",
          purple: "#7C3AED",
          yellow: "#FFD12E",
          lime: "#B6F02E",
          pink: "#FF4D8D",
          cyan: "#22D3EE",
        },
      },
      boxShadow: {
        pop: "6px 6px 0 0 #14110F",
        "pop-sm": "3px 3px 0 0 #14110F",
        "pop-lg": "10px 10px 0 0 #14110F",
        inset: "inset 0 2px 0 0 rgba(255,255,255,0.35)",
      },
      borderRadius: {
        blob: "2rem",
      },
      keyframes: {
        wobble: {
          "0%,100%": { transform: "rotate(-1.5deg) translateY(0)" },
          "50%": { transform: "rotate(1.5deg) translateY(-2px)" },
        },
        shake: {
          "0%,100%": { transform: "translate(0,0) rotate(0)" },
          "20%": { transform: "translate(-6px,3px) rotate(-1deg)" },
          "40%": { transform: "translate(5px,-4px) rotate(1deg)" },
          "60%": { transform: "translate(-4px,2px) rotate(-0.5deg)" },
          "80%": { transform: "translate(3px,3px) rotate(0.5deg)" },
        },
        squish: {
          "0%": { transform: "scale(1,1)" },
          "35%": { transform: "scale(1.25,0.7)" },
          "70%": { transform: "scale(0.85,1.15)" },
          "100%": { transform: "scale(1,1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "float-y": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        wobble: "wobble 1.6s ease-in-out infinite",
        shake: "shake 0.45s ease-in-out",
        squish: "squish 0.4s ease-out",
        marquee: "marquee 24s linear infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "float-y": "float-y 4s ease-in-out infinite",
        "pop-in": "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      },
    },
  },
  plugins: [],
};
