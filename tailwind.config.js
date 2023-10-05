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
      'palia-blue': '#3A4A6B',
      'palia-dark-blue': '#2B3750',
      'misc': '#8B8072',
      'misc-saturated': '#bfa178',
      'misc-secondary': '#00000025',
      'growth-boost': '#ED915E',
      'quality-increase': '#E0AA4A',
      'weed-prevention': '#D86046',
      'harvest-boost': '#97AF51',
      'water-retain': '#73ABBD',
      'white': '#FFF',
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
