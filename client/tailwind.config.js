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
        brand: {
          light: '#ff6b81',
          DEFAULT: '#ff4757',
          dark: '#ff2e44',
          orange: '#ffa502',
          yellow: '#eccc68'
        },
        darkBg: {
          DEFAULT: '#0f172a', // Slate 900
          card: '#1e293b',   // Slate 800
          border: '#334155'  // Slate 700
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
