/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        temple: {
          maroon: "#3B0F14",   // deep sanctum shadow
          wine: "#5A1A22",
          saffron: "#E8871E",  // primary accent - dhoti/robes
          gold: "#F4B93E",     // deity ornaments
          cream: "#FBF3E7",    // light section background
          ivory: "#FBF1DE",    // text on dark
          peacock: "#0F5C56",  // Krishna accent, used sparingly
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        body: ["Mulish", "sans-serif"],
      },
      backgroundImage: {
        "temple-gradient":
          "linear-gradient(180deg, #3B0F14 0%, #5A1A22 100%)",
      },
    },
  },
  plugins: [],
};
