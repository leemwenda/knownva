/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F4F3FF',
          100: '#EBE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#635BDB',
          600: '#524BC4',
          700: '#433CA3',
          800: '#373281',
          900: '#101522',
        }
      }
    },
  },
  plugins: [],
};
