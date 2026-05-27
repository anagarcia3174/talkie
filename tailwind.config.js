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
          50: '#f7f7f8',
          100: '#ececee',
          200: '#dddddf',
          300: '#c6c6ca',
          400: '#a8a8ae',
          500: '#8a8a92',
          600: '#6b6b74',
          700: '#4f4f57',
          800: '#343438',
          900: '#1c1c1e',
          950: '#0d0d0d',
        },
      },
    },
  },
  plugins: [],
};
