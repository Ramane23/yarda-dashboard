import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/** Semantic colour backed by a CSS variable from `globals.css` (supports `/opacity`). */
const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

/**
 * Tailwind theme of the YARDA dashboard.
 *
 * New code uses the **semantic** colours (`bg-card`, `text-muted-foreground`,
 * `bg-risk-block-soft`…), which follow the theme automatically. The `surface`
 * and `brand` ramps remain for pages not yet migrated; they are aligned on
 * the same neutral (zinc) and the single brand violet so nothing clashes.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1440px" } },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }], // 11 px: the minimum
      },
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: { DEFAULT: token("card"), foreground: token("card-foreground") },
        popover: { DEFAULT: token("popover"), foreground: token("popover-foreground") },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        "subtle-foreground": token("subtle-foreground"),
        accent: { DEFAULT: token("accent"), foreground: token("accent-foreground") },
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
          soft: token("primary-soft"),
          "soft-foreground": token("primary-soft-foreground"),
        },
        destructive: { DEFAULT: token("destructive"), foreground: token("destructive-foreground") },
        success: token("success"),
        warning: token("warning"),
        info: token("info"),
        risk: {
          allow: token("risk-allow"),
          "allow-soft": token("risk-allow-soft"),
          review: token("risk-review"),
          "review-soft": token("risk-review-soft"),
          alert: token("risk-alert"),
          "alert-soft": token("risk-alert-soft"),
          block: token("risk-block"),
          "block-soft": token("risk-block-soft"),
        },
        phase: {
          detection: token("phase-detection"),
          learning: token("phase-learning"),
          classification: token("phase-classification"),
          intelligence: token("phase-intelligence"),
        },
        chart: {
          1: token("chart-1"),
          2: token("chart-2"),
          3: token("chart-3"),
          4: token("chart-4"),
          5: token("chart-5"),
          6: token("chart-6"),
        },
        // Legacy ramps (zinc neutral, violet brand); 400 darkened for contrast.
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        surface: {
          0: "#ffffff",
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#83838d",
          500: "#66666f",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          850: "#1c1c1f",
          900: "#141416",
          950: "#0a0a0b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        "card-hover": "0 2px 8px -2px rgb(0 0 0 / 0.08)",
        "dark-card": "0 1px 2px 0 rgb(0 0 0 / 0.4)",
        glow: "0 0 0 1px hsl(var(--border))",
        "glow-lg": "0 0 0 1px hsl(var(--border))",
        overlay: "0 16px 48px -12px rgb(0 0 0 / 0.25), 0 0 0 1px hsl(var(--border))",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out both",
        "slide-in": "slide-in 0.2s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
