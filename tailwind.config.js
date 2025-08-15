/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./test*.html",
    "./tests/**/*.html",
    "./**/*.{js,ts}",
    "!./node_modules/**"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
