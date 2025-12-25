/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pro: {
          bg: '#1b1b1b',       // LrC Workspace Gray
          panel: '#262626',    // LrC Panel Gray
          card: '#303030',     // Slightly lighter for inputs/cards
          border: '#3a3a3a',   // 1px separators
          text: '#d4d4d4',     // Standard text (not pure white)
          muted: '#8e8e8e',    // Labels
          accent: '#4781ee',   // LrC Blue
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
