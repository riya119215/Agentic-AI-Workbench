/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        canvas: '#F7F6F2',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F0EFEA',
          elevated: '#FFFFFF',
          hover: '#F0EFEA',
        },
        border: {
          subtle: '#DCDAD3',
          strong: '#BEBCB4',
        },
        text: {
          primary: '#171717',
          secondary: '#686762',
          muted: '#8A8881',
        },
        accent: {
          primary: '#00A878',
          hover: '#008F68',
          soft: '#E8F7F1',
          azure: '#00A878', // unified to clean sovereign accent
          emerald: '#008F68',
          violet: '#686762',
        },
        status: {
          error: '#C83A3A',
          warning: '#B7791F',
          success: '#008F68',
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-elevated': '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}