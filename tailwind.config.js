/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1d4ed8',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#15803d',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#fb7185',
          foreground: '#0f172a',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#475569',
        },
      },
    },
  },
  plugins: [],
};
