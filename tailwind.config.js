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
          primary: "#FF6B00",
          dark:    "#C2410C",
          light:   "#FFF7ED",
          accent:  "#FF8C00",
        },
      },
      fontFamily: {
        marathi: ["'Tiro Devanagari Marathi'", "serif"],
        sans:    ["'DM Sans'", "system-ui", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
      },
      backgroundImage: {
        "saffron-gradient": "linear-gradient(135deg, #FF6B00 0%, #FF8C00 50%, #FFB347 100%)",
      },
    },
  },
  plugins: [],
};
