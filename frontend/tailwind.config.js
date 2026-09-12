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
        sovNavy: {
          900: '#071324',
          800: '#0B1D3A',
          700: '#102C57',
          600: '#1E3E7B',
        },
        sovGold: {
          500: '#D4AF37',
          600: '#AA820A'
        }
      }
    },
  },
  plugins: [],
}