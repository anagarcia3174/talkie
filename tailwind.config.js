/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'SpaceGrotesk-Bold': ['SpaceGrotesk-Bold'],
        'SpaceGrotesk-Light': ['SpaceGrotesk-Light'],
        'SpaceGrotesk-Medium': ['SpaceGrotesk-Medium'],
        'SpaceGrotesk-Regular': ['SpaceGrotesk-Regular'],
        'SpaceGrotesk-SemiBold': ['SpaceGrotesk-SemiBold'],
      },
      colors: {
        primary: {
          50:  '#f4f4f5',
          100: '#e7e7ea',
          200: '#d6d6da',
          300: '#b9b9bf',
          400: '#9a9aa3',
          500: '#7c7c86',
          600: '#63636d',
          700: '#4a4a52',
          800: '#34343a',
          900: '#1f1f23',
          950: '#111111',
        },
      },
    },
  },
  plugins: [],
};