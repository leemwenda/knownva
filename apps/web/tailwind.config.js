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
          500: '#635BDB',
          600: '#524BC4',
          900: '#101522',
        }
      }
    },
  },
  plugins: [],
};
