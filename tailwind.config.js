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
    },
  },
  daisyui: {
    themes: [{
      frnkrs: {
        'primary': '#D4C9B3',
        'primary-content': '#8B8072',
        'secondary': '#E1D7C6',
        'secondary-content': '#8B8072',
        'accent': '#EEE3D1',
        'accent-content': '#8B8072',
        'neutral': '#2e282a',
        'base-100': '#3A4A6B',
        'base-200': '#2B3750',
        'base-300': '#8B8072',
        'base-content': '#EEE3D1',
        'info': '#73ABBD',
        'success': '#97AF51',
        'success-content': '#EEE3D1',
        'warning': '#ED915E',
        'warning-content': '#EEE3D1',
        'error': '#D86046',
        'error-content': '#EEE3D1',
        '.btn-misc': {
          'background-color': '#8B8072',
          'color': '#EEE3D1',
        },
        '.btn-misc:hover': {
          'background-color': '#00000025',
          'color': '#EEE3D1',
        },
      },
    }],
  },
  plugins: [require('daisyui')],
}
