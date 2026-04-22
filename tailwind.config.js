/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        whisky: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f4daa8',
          300: '#ecc06e',
          400: '#e3a03c',
          500: '#d4841f',
          600: '#b86815',
          700: '#984e13',
          800: '#7c3f16',
          900: '#663514',
        },
      },
    },
  },
  plugins: [],
}
