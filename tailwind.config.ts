import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07111F",
        deep: "#050B14",
        surface: "#0C1828",
        elevated: "#102238",
        primary: {
          DEFAULT: "#6C63FF",
          hover: "#5a50f5",
          light: "#8B7CFF",
        },
        secondary: {
          DEFAULT: "#35C6FF",
          hover: "#21b2eb",
        },
        accent: "#8B7CFF",
        success: {
          DEFAULT: "#35D6A2",
          surface: "rgba(53, 214, 162, 0.12)",
        },
        warning: {
          DEFAULT: "#FFC857",
          surface: "rgba(255, 200, 87, 0.12)",
        },
        critical: {
          DEFAULT: "#FF647C",
          surface: "rgba(255, 100, 124, 0.12)",
        },
        info: {
          DEFAULT: "#50B8FF",
          surface: "rgba(80, 184, 255, 0.12)",
        },
        text: {
          primary: "#F7F9FC",
          secondary: "#A9B5C7",
          muted: "#6F7D91",
        },
        nexora: {
          bg: "#07111F",
          surface: "#0C1828",
          elevated: "#102238",
          primary: "#6C63FF",
          secondary: "#35C6FF",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.04)",
          glow: "rgba(108, 99, 255, 0.3)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #6C63FF 0%, #35C6FF 100%)",
        "gradient-subtle": "linear-gradient(180deg, rgba(16, 34, 56, 0.8) 0%, rgba(12, 24, 40, 0.95) 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 24px -4px rgba(108, 99, 255, 0.4)",
        "glow-cyan": "0 0 24px -4px rgba(53, 198, 255, 0.4)",
        "glow-sm": "0 0 12px -2px rgba(108, 99, 255, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
