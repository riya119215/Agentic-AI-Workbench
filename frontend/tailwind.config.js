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
          hover: '#F0EFEA',
          subtle: '#FAF9F6',
        },
        border: {
          subtle: '#EAE8E2',
          DEFAULT: '#DCDAD3',
          strong: '#BEBCB4',
        },
        primary: {
          DEFAULT: '#171717',
          secondary: '#686762',
          muted: '#9E9D98',
        },
        accent: {
          DEFAULT: '#00A878',
          hover: '#008F66',
          light: '#E6F7F2',
          text: '#006B4D',
        },
        violet: {
          DEFAULT: '#7C5CFC',
          light: '#F2EFFE',
        },
        sovWarm: {
          50: '#FAF9F6',
          100: '#F0EFEA',
          200: '#E6E4DD',
          300: '#DCDAD3',
        },
        sovGraphite: {
          50: '#F7F6F2',
          100: '#F0EFEA',
          200: '#E4E2DC',
          300: '#DCDAD3',
          400: '#9E9D98',
          500: '#686762',
          600: '#484744',
          700: '#2E2D2B',
          800: '#1F1E1D',
          900: '#171717',
          950: '#0F0F0E',
        },
        sovBorder: {
          subtle: '#EAE8E2',
          DEFAULT: '#DCDAD3',
          strong: '#BEBCB4',
        }
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sov-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'sov-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'sov-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}