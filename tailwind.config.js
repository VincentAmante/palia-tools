const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './assets/**/*.{js,ts}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    colors: {
      'primary': '#D4C9B3',
      'secondary': '#E1D7C6',
      'accent': '#EEE3D1',
      'neutral': '#2e282a',
      'base-100': '#3A4A6B',
      'base-200': '#2B3750',
      'base-300': '#8B8072',
      'success': '#97AF51',
      'warning': '#ED915E',
      'error': '#D86046',
      'palia-blue': {
        DEFAULT: '#3A4A6B',
        dark: '#2B3750',
      },
      'misc': {
        DEFAULT: '#8B8072',
        dark: '#6E6357',
        saturated: '#BFA178',
        secondary: '#00000025',
      },
      'growth-boost': '#ED915E',
      'quality-increase': {
        DEFAULT: '#E0AA4A',
        dark: '#C68A1F',
        light: '#F1C87A',
      },
      'weed-prevention': '#D86046',
      'harvest-boost': {
        DEFAULT: '#97AF51',
        dark: '#708E18',
      },
      'water-retain': '#73ABBD',
      'white': '#FFF',
    },
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      fontFamily: {
        serif: ['"Roboto Slab"', 'serif'],
      },
      fontSize: {
        xxs: ['0.625rem', {
          lineHeight: '1rem',
        }],
      },
    },
  },

}
