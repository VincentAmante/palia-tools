<script setup lang="ts">
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import { useToasts } from '~/stores/useToasts'
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
</script>

<template>
  <main class="flex flex-col gap-4 py-2">
    <h1 class="sr-only">
      Garden Planner
    </h1>
    <GuideCard />
    <section class="lg:px-12">
      <GardenPlanner />

      <MenuBar />
    </section>
    <!-- <DevOnly>
      <div class="fixed bottom-0 right-0 flex flex-col gap-2 p-2 mx-12 my-2 rounded-md w-fit bg-accent bg-opacity-10">
        <p class="text-sm">
          Toggle Screenshot Mode
        </p>
        <button
          class="btn btn-accent"
          @click="isTakingScreenshot.set(!isTakingScreenshot.get)"
        >
          {{ isTakingScreenshot.get }}
        </button>
      </div>
    </DevOnly> -->
    <CropModalButton :position="uiSettings.settings.floatComponentLocation" />
    <Teleport to="body">
      <section id="toasts" class="toast z-1000" :class="toastLocation">
        <Toast v-for="(toast) in toasts.toasts" :key="toast.id" :message="toast.message" :type="toast.type"
          :id="toast.id!" :duration="toast.duration" @close="() => { toasts.removeToast(toast.id!) }" />
      </section>
    </Teleport>
  </main>
</template>
