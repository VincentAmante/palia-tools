<script setup lang="ts">
import NewGardenDisplay from './garden-planner/NewGardenDisplay.vue'
import NewStatsDisplay from './garden-planner/NewStatsDisplay.vue'
import OutputDisplay from './garden-planner/OutputDisplay.vue'
import ItemSelector from '~/components/garden-planner/ItemSelector/ItemSelector.vue'
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import useGarden from '~/stores/useGarden'

const display = ref<HTMLElement | null>(null)
const isTakingScreenshot = useTakingScreenshot()

const gardenHandler = useGarden()
</script>

<template>
  <section
    ref="display"
  >
    <div class="sm:py-1 rounded-t-md sm:px-2 bg-accent">
      <ItemSelector />
      <AppDivider
        class="order-3 mx-4 my-1 lg:col-span-7 "
        :class="[isTakingScreenshot.get ? 'col-span-7' : '']"
      />
      <section
        class="flex flex-col sm:py-2 gap-y-4"
        :class="[gardenHandler.isGardenWide ? '' : 'lg:flex-row']"
      >
        <section
          class="h-full"
          :class="[gardenHandler.isGardenWide ? 'flex flex-col items-center pb-2' : '']"
        >
          <NewGardenDisplay />
          <NewStatsDisplay
            class="pt-2 sm:mx-auto xs:px-2 w-fit "
            :class="[gardenHandler.isGardenWide ? 'w-fit' : 'lg:w-full']"
          />
        </section>
        <section class="w-full sm:px-2">
          <div class="h-full sm:rounded-lg bg-primary">
            <OutputDisplay />
          </div>
        </section>
      </section>
    </div>
  </section>
</template>
