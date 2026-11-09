/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07080A',
          900: '#0C0E11',
        },
        graphite: {
          800: '#14171C',
          700: '#1D2128',
          600: '#2A303C',
        },
        steel: {
          500: '#7C8591',
          400: '#94A3B8',
        },
        bone: {
          100: '#ECEFF2',
          200: '#D5DBE1',
        },
        cyan: {
          400: '#19E3FF',
          500: '#00CFEE',
          900: '#083344',
        },
        lime: {
          400: '#C6FF3D',
          500: '#A3E635',
          900: '#23380B',
        },
        orange: {
          500: '#FF6B1A',
          600: '#EA580C',
          900: '#431407',
        },
        coral: {
          500: '#FF5A6E',
          600: '#E11D48',
          900: '#4C0519',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"Instrument Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      clipPath: {
        chamfer: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
      },
      boxShadow: {
        'cyan-glow': '0 0 24px -4px rgba(25, 227, 255, 0.35)',
        'lime-glow': '0 0 24px -4px rgba(198, 255, 61, 0.35)',
        'orange-glow': '0 0 24px -4px rgba(255, 107, 26, 0.35)',
      },
    },
  },
  plugins: [],
}
