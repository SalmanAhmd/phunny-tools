/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        cream: {
          DEFAULT: "#F7F2E7",
          deep: "#EAE1CF",
        },
        ink: {
          DEFAULT: "#0D0C0A",
          soft: "#3A342E",
          muted: "#57513F",
          night: "#0A0908",
        },
        tangerine: "#FF6A00",
        grape: "#7C3AED",
        sunrise: "#FFD400",
        limey: "#B4E600",
        bubblegum: "#FF4FA3",
      },
      boxShadow: {
        pop: "6px 6px 0 0 #0D0C0A",
        popsm: "3px 3px 0 0 #0D0C0A",
        poplg: "10px 10px 0 0 #0D0C0A",
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
        blip: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
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
        blip: "blip 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};