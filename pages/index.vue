<script setup lang="ts">
import { useToasts } from '~/stores/useToasts'
import CropModalButton from '~/components/garden-planner/ItemSelector/CropModalButton.vue'
import MenuBar from '~/components/garden-planner/MenuBar.vue'
import AppToast from '~/components/AppToast.vue'


useHead({
  title: 'Palia Garden Planner | Plot Editor',
  meta: [
    {
      name: 'description',
      content: 'An unofficial fan-made Garden Planner for the game Palia. Displays bonus coverage based on crops and fertilisers, and approximates the harvest value.',
    },
  ],
})

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
</script>

<template>
  <main id="main" class="flex flex-col gap-4 py-2" :class="{ 'dark': false }">
    <h2 class="sr-only">
      Garden Planner
    </h2>
    <GuideCard />
    <section class="lg:px-12">
      <GardenPlanner />
      <ClientOnly>

        <MenuBar />
      </ClientOnly>
    </section>
    <CropModalButton :position="uiSettings.settings.floatComponentLocation" />
    <Teleport to="body">
      <section id="toasts" class="toast z-1000" :class="toastLocation">
        <AppToast
v-for="(toast) in toasts.toasts" :id="toast.id!" :key="toast.id" :message="toast.message"
          :type="toast.type" :duration="toast.duration" @close="() => { toasts.removeToast(toast.id!) }" />
      </section>
    </Teleport>
  </main>
</template>
