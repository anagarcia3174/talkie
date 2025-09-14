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
        'SpaceGrotesk-SemiBold': ['SpaceGrotesk-SemiBold']
      },
      colors: {
       primary: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a', 
          600: '#52525b',
          700: '#3f3f46',
          800: '#404040', 
          900: '#262626', 
          950: '#1a1a1a', 
        },    
      },
    },
  },
  plugins: [],
};
