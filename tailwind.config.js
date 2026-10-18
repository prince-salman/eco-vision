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
          bg: '#0B1318',
          surface: '#111D24',
          card: '#16252E',
          border: '#243A46',
          muted: '#8A9FA8',
          ink: '#E8F1F5',
          teal: '#2DD4BF',
          accent: '#0D9488',
          green: '#10B981',
          emerald: '#34D399',
          amber: '#F59E0B',
          coral: '#F87171',
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
