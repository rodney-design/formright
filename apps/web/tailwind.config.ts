import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#0D1F3C",
          light: "#162645",
        },
        teal: {
          DEFAULT: "#00897B",
          light: "#26A69A",
          pale: "#E0F2F1",
        },
        gold: {
          DEFAULT: "#F9A825",
          dark: "#F57F17",
        },
        yellow: {
          DEFAULT: "#F9A825",
          pale: "#FFF8E1",
        },
        success: "#10b981",
        error: "#ef4444",
        warning: "#f59e0b",
        // Entity type accent colors
        "ec-llc": "#00897B",
        "ec-ccorp": "#7C3AED",
        "ec-scorp": "#F9A825",
        "ec-np": "#0EA5E9",
        "ec-sole": "#F97316",
        "ec-benefit": "#16A34A",
        "ec-pc": "#6366F1",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        brand: "14px",
        "brand-lg": "20px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(13,27,42,.10)",
        "card-lg": "0 12px 48px rgba(13,27,42,.16)",
        teal: "0 8px 32px rgba(0,137,123,.25)",
        gold: "0 8px 32px rgba(249,168,37,.30)",
      },
    },
  },
  plugins: [],
};
export default config;
