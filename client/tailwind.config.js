/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#21c45d", 
        "primary-dark": "#16a34a",
        "accent": "#f97316",
        "background-light": "#f0fdf4",
        "background-dark": "#122017",
        "surface": "#ffffff",
      },
      fontFamily: {
          "display": ["Inter", "sans-serif"],
          "body": ["Inter", "sans-serif"]
      },
      borderRadius: {
          "DEFAULT": "1rem", 
          "lg": "2rem", 
          "xl": "3rem", 
          "full": "9999px"
      },
      boxShadow: {
          soft: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }
    },
  },
  plugins: [],
}
