/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: "#f5f5f7",
          surface: "#f0f2f5",
          card: "#ffffff",
          muted: "#e8eaed",
        },
      },
      borderRadius: {
        "clay": "1rem",
        "clay-lg": "1.5rem",
        "clay-xl": "2rem",
      },
      boxShadow: {
        clay: "8px 8px 16px rgba(0,0,0,0.08), -8px -8px 16px rgba(255,255,255,0.6)",
        "clay-sm": "4px 4px 8px rgba(0,0,0,0.06), -4px -4px 8px rgba(255,255,255,0.5)",
        "clay-lg": "12px 12px 24px rgba(0,0,0,0.1), -12px -12px 24px rgba(255,255,255,0.7)",
        "clay-inset": "inset 4px 4px 8px rgba(0,0,0,0.06), inset -4px -4px 8px rgba(255,255,255,0.5)",
      },
    },
  },
  plugins: [],
};
