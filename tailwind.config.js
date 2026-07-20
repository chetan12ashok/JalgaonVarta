/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea6000",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        brand: {
          primary: "#111111",
          dark:    "#000000",
          light:   "#FFF5BF",
          accent:  "#FFD735",
        },
      },
      fontFamily: {
        marathi: ["'Tiro Devanagari Marathi'", "serif"],
        sans:    ["'DM Sans'", "system-ui", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
      },
      backgroundImage: {
        "saffron-gradient": "linear-gradient(135deg, #000000 0%, #242424 58%, #FFD735 100%)",
      },
    },
  },
  plugins: [],
};
