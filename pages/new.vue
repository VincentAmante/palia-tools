<script setup lang="ts">
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'

useHead({
  title: 'New Page',
  meta: [
    {
      name: 'description',
      content: 'This is a new page',
    },
  ],
})

const isTakingScreenshot = useTakingScreenshot()
</script>

<template>
  <main class="flex flex-col gap-4 py-2">
    <h1 class="sr-only">
      Garden Planner
    </h1>
    <GuideCard />
    <GardenPlanner />
    <DevOnly>
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
    </DevOnly>
  </main>
</template>
