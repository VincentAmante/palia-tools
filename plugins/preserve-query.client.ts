export default defineNuxtPlugin({
  name: 'preserve-query-on-hydration',
  order: -25, // after nuxt:revive-payload (-30), before nuxt:router (-20)
  setup(nuxtApp) {
    if (nuxtApp.payload?.prerenderedAt && window.location.search) {
      delete nuxtApp.payload.path
    }
  },
})