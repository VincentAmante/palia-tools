<script setup lang="ts">
import NewGardenDisplay from './garden-planner/NewGardenDisplay.vue'
import NewStatsDisplay from './garden-planner/NewStatsDisplay.vue'
import ItemSelector from '~/components/garden-planner/ItemSelector/ItemSelector.vue'
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'

const display = ref<HTMLElement | null>(null)
const isTakingScreenshot = useTakingScreenshot()
</script>

<template>
  <section
    ref="display"
    class="lg:px-12"
  >
    <div class="py-1 rounded-md bg-accent">
      <ItemSelector />
      <AppDivider
        class="order-3 mx-4 my-4 mt-2 lg:col-span-7 "
        :class="[isTakingScreenshot.get ? 'col-span-7' : '']"
      />
      <NewGardenDisplay />
      <NewStatsDisplay class="pt-2 pb-2 w-fit" />
    </div>
  </section>
</template>
