/** @type {import('tailwindcss').Config} */
export default {
  // constants.tsx y utils/scoring.ts arman clases de color, por eso se escanea
  // la raiz completa y no solo components/.
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
