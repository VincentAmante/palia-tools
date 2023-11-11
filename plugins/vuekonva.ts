import VueKonva from 'vue-konva'
import Konva from 'konva'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueKonva, { Konva })
})
