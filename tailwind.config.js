/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0908',
        paper: '#FBF5F3',
        concrete: '#8B8680',
        'partner-a': '#E63946',
        'partner-b': '#06AED5',
        unassigned: '#F1C453',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Crimson Pro', 'serif'],
        hebrew: ['Frank Ruhl Libre', 'serif'],
      },
      boxShadow: {
        brutal: 'rgba(10,9,8,0.15) 0 8px 16px',
        'brutal-sm': 'rgba(10,9,8,0.1) 0 2px 4px',
      },
      animation: {
        'card-flip': 'cardFlip 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'stagger-item': 'revealUp 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards',
      },
      keyframes: {
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
