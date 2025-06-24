/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['Roboto Mono', 'monospace'],
        'serif': ['Source Serif 4', 'serif'],
      },
    },
  },
  plugins: [],
}
