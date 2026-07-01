/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        void: "#07080F",
        abyss: "#0B0D1A",
        panel: "rgba(255,255,255,0.04)",
        edge: "rgba(255,255,255,0.08)",
        cyan: {
          DEFAULT: "#00F0FF",
          glow: "#00F0FF",
        },
        magenta: {
          DEFAULT: "#FF2D9C",
          glow: "#FF2D9C",
        },
        ink: {
          50: "#E8ECFF",
          300: "#B4BCDC",
          500: "#7A82A8",
          700: "#3D4368",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        serif: ['"Instrument Serif"', "serif"],
      },
      boxShadow: {
        "cyan-glow": "0 0 24px rgba(0,240,255,0.45), 0 0 48px rgba(0,240,255,0.18)",
        "magenta-glow": "0 0 24px rgba(255,45,156,0.4), 0 0 48px rgba(255,45,156,0.15)",
        panel: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "cyan-grad": "linear-gradient(135deg, #00F0FF 0%, #00B4FF 100%)",
        "magenta-grad": "linear-gradient(135deg, #FF2D9C 0%, #B418FF 100%)",
        "grid-fade":
          "radial-gradient(circle at 50% 0%, rgba(0,240,255,0.08), transparent 60%)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "float-up": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(-40px)", opacity: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        "float-up": "float-up 3s ease-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
