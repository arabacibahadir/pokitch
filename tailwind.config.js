/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      tablet: "768px",
      laptop: "1200px",
      desktop: "1400px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        laptop: "0",
      },
      screens: {
        tablet: "720px",
        laptop: "1140px",
        desktop: "1320px",
      },
    },
    extend: {
      colors: {
        border: "oklch(var(--border) / <alpha-value>)",
        input: "oklch(var(--input) / <alpha-value>)",
        ring: "oklch(var(--ring) / <alpha-value>)",
        background: "oklch(var(--background) / <alpha-value>)",
        foreground: "oklch(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "oklch(var(--primary) / <alpha-value>)",
          foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
          foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
          foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "oklch(var(--muted) / <alpha-value>)",
          foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "oklch(var(--accent) / <alpha-value>)",
          foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "oklch(var(--popover) / <alpha-value>)",
          foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "oklch(var(--card) / <alpha-value>)",
          foreground: "oklch(var(--card-foreground) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "oklch(var(--surface) / <alpha-value>)",
          foreground: "oklch(var(--surface-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-custom)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionProperty: {
        width: "width",
        display: "display",
      },
    },
  },
  plugins: [],
};
