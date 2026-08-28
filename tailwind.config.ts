import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#08090A",
        surface: {
          panel: "#121417",
          card: "#181B20",
          elevated: "#21252C",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          glow: "rgba(255, 255, 255, 0.15)",
        },
        accent: {
          volt: "#D4FF00",
          orange: "#FF5500",
          cyan: "#00F0FF",
          purple: "#A855F7",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Geist Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "Cabinet Grotesk",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "glow-volt": "0 0 20px rgba(212, 255, 0, 0.35)",
        "glow-orange": "0 0 20px rgba(255, 85, 0, 0.35)",
        "glow-cyan": "0 0 20px rgba(0, 240, 255, 0.35)",
        "inner-bezel": "inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -1px 2px rgba(0, 0, 0, 0.8)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "beacon": "beacon 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        beacon: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "50%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(0.8)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
