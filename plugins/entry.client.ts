// ~/plugins/entry.client.ts
import { NuxtLink } from '#components'
import AppDivider from '~/components/AppDivider.vue'
import PGPFooter from '~/components/PGPFooter.vue'
import PGPHeader from '~/components/PGPHeader.vue'
import Toast from '~/components/Toast.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('NuxtLink', NuxtLink)
  nuxtApp.vueApp.component('AppDivider', AppDivider)
  nuxtApp.vueApp.component('PGPFooter', PGPFooter)
  nuxtApp.vueApp.component('PGPHeader', PGPHeader)
  nuxtApp.vueApp.component('Toast', Toast)
})