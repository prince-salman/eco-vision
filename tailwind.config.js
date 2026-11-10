/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eco: {
          bg: '#F8FAFC',        // Crisp bright white-slate background
          surface: '#FFFFFF',   // Pure white surface
          card: '#FFFFFF',      // Pure white card with soft shadows
          border: '#E2E8F0',    // Crisp border
          muted: '#64748B',     // Legible slate muted text
          ink: '#0F172A',       // Deep high-contrast ink text
          teal: '#059669',      // Rich emerald green primary
          accent: '#10B981',    // Vibrant mint accent
          green: '#16A34A',     // Green
          emerald: '#047857',   // Deep emerald
          amber: '#D97706',     // Amber
          coral: '#EF4444',     // Coral red
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
