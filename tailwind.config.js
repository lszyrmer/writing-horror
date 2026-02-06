/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'Courier', 'monospace'],
      },
      colors: {
        dark: {
          DEFAULT: '#121212',
          light: '#1e1e1e',
          lighter: '#2a2a2a',
        },
        danger: {
          DEFAULT: '#8B0000',
          light: '#A52A2A',
          dark: '#5C0000',
        },
        success: {
          DEFAULT: '#86EFAC',
          light: '#BBF7D0',
          dark: '#4ADE80',
        },
      },
    },
  },
  plugins: [],
};
