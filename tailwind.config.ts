import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        // Premium Candle Theme: Warm Amber/Clay & Deep Charcoal
        primary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#a77f71', // Warm Clay/Terra Cotta
          600: '#8a5a4d',
          700: '#73463c',
          800: '#5e3830',
          900: '#452823',
        },
        // Sage/Nature Accent
        accent: {
          50: '#f4f7f5',
          100: '#e3ebe6',
          200: '#c7dcd3',
          300: '#a4c6b8',
          400: '#83ad9e',
          500: '#649485', // Muted Sage
          600: '#4d7a6c',
          700: '#3e6156',
          800: '#334e46',
          900: '#2a3d38',
        },
        // Elegant Neutrals
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524', // Warm Black
          900: '#1c1917',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config

