/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./convex/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        solar: {
          DEFAULT: "#f59e0b", // Amber
          glow: "rgba(245, 158, 11, 0.15)",
        },
        wind: {
          DEFAULT: "#0ea5e9", // Sky blue
          glow: "rgba(14, 165, 233, 0.15)",
        },
        bess: {
          DEFAULT: "#10b981", // Emerald green
          glow: "rgba(16, 185, 129, 0.15)",
        },
        alarm: {
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#3b82f6",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)" },
          "50%": { opacity: 0.6, boxShadow: "0 0 5px rgba(16, 185, 129, 0.1)" },
        },
        "pulse-glow-red": {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)" },
          "50%": { opacity: 0.6, boxShadow: "0 0 5px rgba(239, 68, 68, 0.2)" },
        },
        "radar-pulse": {
          "0%": { transform: "scale(0.95)", opacity: 0.8 },
          "50%": { opacity: 0.4 },
          "100%": { transform: "scale(1.8)", opacity: 0 }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow-red": "pulse-glow-red 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar": "radar-pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
