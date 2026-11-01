/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          50:  '#F4F3FF',
          100: '#EBE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B7FF0',
          600: '#635BDB',
          700: '#524BC4',
          800: '#433CA3',
          900: '#101522',
        },
      },
    },
  },
  plugins: [],
};
