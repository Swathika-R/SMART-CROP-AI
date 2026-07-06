/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          dark: '#0B2216',     // Deep Forest Green background/text
          deep: '#0F301F',     // Dark green panels
          medium: '#1B4D36',   // Forest green accents
          green: '#2E8B57',    // Emerald Green main branding
          soft: '#EAF4EF',     // Soft Sage Green backgrounds
          mint: '#9FE2BF',     // Mint highlight
          gold: '#D4AF37',     // Harvest Amber Gold accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
