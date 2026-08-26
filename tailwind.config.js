/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1568a8',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#15803d',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#c5e0f4',
          foreground: '#2d5574',
        },
      },
    },
  },
  plugins: [],
};
