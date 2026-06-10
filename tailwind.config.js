/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        dark: {
          900: '#0a0e1a',
          800: '#0f1424',
          700: '#151b30',
          600: '#1a2238',
        },
        electric: {
          DEFAULT: '#00d4ff',
          dim: '#0099bb',
        },
        neon: {
          green: '#00ff88',
          orange: '#ffaa00',
          red: '#ff3366',
          orange2: '#ff6b35',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
