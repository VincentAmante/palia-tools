/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Roboto Slab"', 'serif'],
      },
    },
  },
  daisyui: {
    themes: ['retro'],
  },
  plugins: [require('daisyui')],
}
