/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#2D3142',
        paper: '#FAFAF8',
        concrete: '#9CA3AF',
        accent: '#A78BFA',
        'partner-a': '#E07A8E',
        'partner-b': '#7FB69E',
        unassigned: '#F5D89A',
        'partner-a-light': '#FAE0E6',
        'partner-b-light': '#DFF0E8',
        'unassigned-light': '#FFF5DC',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        hebrew: ['Noto Sans Hebrew', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 12px rgba(0,0,0,0.06)',
        'soft-sm': '0 1px 3px rgba(0,0,0,0.04)',
        'soft-lg': '0 8px 24px rgba(0,0,0,0.08)',
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
