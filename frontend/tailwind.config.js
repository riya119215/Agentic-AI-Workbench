/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Public Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        gov: {
          navy: {
            DEFAULT: '#0B192C',
            dark: '#07111E',
            light: '#1E3E62',
            accent: '#1B365D',
          },
          gold: {
            DEFAULT: '#D97706',
            light: '#F59E0B',
            dark: '#B45309',
            soft: '#FEF3C7',
          },
          slate: {
            DEFAULT: '#F4F6F9',
            dark: '#E2E8F0',
            border: '#CBD5E1',
          },
          emerald: {
            DEFAULT: '#059669',
            light: '#10B981',
            soft: '#D1FAE5',
          },
        },
        canvas: '#F4F6F9',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#EBF0F5',
          elevated: '#FFFFFF',
          hover: '#F1F5F9',
        },
        border: {
          subtle: '#CBD5E1',
          strong: '#94A3B8',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        accent: {
          primary: '#1E3E62',
          hover: '#0B192C',
          soft: '#E0F2FE',
          azure: '#1E3E62',
          emerald: '#059669',
          violet: '#475569',
          gold: '#D97706',
        },
        status: {
          error: '#DC2626',
          warning: '#D97706',
          success: '#059669',
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'card': '0 1px 3px 0 rgba(11, 25, 44, 0.06), 0 1px 2px -1px rgba(11, 25, 44, 0.04)',
        'card-elevated': '0 6px 16px -2px rgba(11, 25, 44, 0.10), 0 2px 6px -2px rgba(11, 25, 44, 0.06)',
        'gov-badge': '0 0 0 1px rgba(217, 119, 6, 0.3), 0 2px 4px rgba(11, 25, 44, 0.08)',
      },
    },
  },
  plugins: [],
}