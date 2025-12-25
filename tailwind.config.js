/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#222222",
        secondary: "#FF6D1F",
        tertiary: "#F5E7C6",
        fourth: "#FAF3E1",
      },
    },
  },
  plugins: [],
};
