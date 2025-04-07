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
        primary: {
          50: '#ebf5ff',
          100: '#e1efff',
          200: '#c3dfff',
          300: '#a4cfff',
          400: '#86bfff',
          500: '#5a9eff',
          600: '#3a7ff1',
          700: '#2563eb',
          800: '#1d4ed8',
          900: '#1e40af',
          950: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-xl': '0 10px 25px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      }
    },
  },
  plugins: [],
}

