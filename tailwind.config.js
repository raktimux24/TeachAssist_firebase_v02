/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#66B2FF',
          600: '#0055FF',
          700: '#0044CC',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
