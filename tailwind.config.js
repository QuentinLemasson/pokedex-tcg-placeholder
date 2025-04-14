/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ffcb05",
        secondary: "#3c5aa6",
        textColor: "#2a2a2a",
        cardBg: "white",
        appBg: "#f4f4f4",
      },
    },
  },
  plugins: [],
};
