<script setup lang="ts">
import CropModalButton from '~/components/garden-planner/ItemSelector/CropModalButton.vue'
import MenuBar from '~/components/garden-planner/MenuBar.vue'
import Toast from '~/components/Toast.vue'

useHead({
  title: 'Palia Garden Planner',
  meta: [
    {
      name: 'description',
      content: 'This is a new page',
    },
  ],
})

const isTakingScreenshot = useTakingScreenshot()
const toasts = useToasts()

const uiSettings = useUiSettings()
const toastLocation = computed(() => {
  switch (uiSettings.settings.toastsLocation) {
    case 'top-left':
      return 'toast-top toast-start'
    case 'top-center':
      return 'toast-top toast-center'
    case 'top-right':
      return 'toast-top toast-end'
    case 'bottom-left':
      return 'toast-bottom toast-start'
    case 'bottom-center':
      return 'toast-bottom toast-center'
    case 'bottom-right':
      return 'toast-bottom toast-end'
    default:
      return 'toast-top toast-start'
  }
})
useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://palia-garden-planner.vercel.app/compact',
    },
  ],
})

definePageMeta({
  layout: 'compact',
})
</script>


<template>
  <main class="flex flex-col gap-4 bg-palia-dark">
    <section class="">
      <GardenPlanner />

      <MenuBar />
    </section>
    <CropModalButton :position="uiSettings.settings.floatComponentLocation" />
    <Teleport to="body">
      <section id="toasts" class="toast z-1000" :class="toastLocation">
        <Toast v-for="(toast) in toasts.toasts" :key="toast.id" :message="toast.message" :type="toast.type"
          :id="toast.id!" :duration="toast.duration" @close="() => { toasts.removeToast(toast.id!) }" />
      </section>
    </Teleport>
  </main>
</template>
