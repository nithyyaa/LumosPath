/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        tealDark: '#0b3a36',
        tealGlow: '#0fe9d2'
      },
      boxShadow: {
        glow: '0 6px 20px rgba(11,58,54,0.45), inset 0 0 18px rgba(15,233,210,0.08)'
      },
      borderRadius: {
        'xl-lg': '18px'
      }
    },
  },
  plugins: [],
}
