/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Suporte para modo escuro via classe
  theme: {
    extend: {
      colors: {
        // Cores customizadas do Server Hub
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      gridTemplateColumns: {
        'auto-fill-cards': 'repeat(auto-fill, minmax(280px, 1fr))',
      }
    },
  },
  plugins: [],
}
