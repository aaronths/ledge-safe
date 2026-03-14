/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#070f24",
          900: "#0c1b3d",
          800: "#142a56",
        },
        ocean: {
          400: "#4f7db8",
          300: "#6a95ca",
        },
        sand: {
          100: "#f7ead5",
          200: "#eacda0",
          300: "#d8b372",
          400: "#c69a4f",
        },
      },
    },
  },
  plugins: [],
};
