/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  '#1DB954',
        surface:  '#121212',
        card:     '#181818',
        border:   '#282828',
        muted:    '#B3B3B3',
        error:    '#E05C5C',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
