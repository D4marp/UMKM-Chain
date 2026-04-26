/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eff8ff",
          100: "#d9ecff",
          200: "#b9ddff",
          300: "#8ac8ff",
          400: "#4ea8ff",
          500: "#1b82ff",
          600: "#005fdb"
        },
        emerald: {
          500: "#0ea37a",
          600: "#058a66"
        }
      },
      boxShadow: {
        glass: "0 24px 60px rgba(0, 76, 133, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};
