<script setup lang="ts">
import NewGardenDisplay from './garden-planner/NewGardenDisplay.vue'
import NewStatsDisplay from './garden-planner/NewStatsDisplay.vue'
import OutputDisplay from './garden-planner/OutputDisplay.vue'
import ItemSelector from '~/components/garden-planner/ItemSelector/ItemSelector.vue'
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import useGarden from '~/stores/useGarden'
import { storeToRefs } from 'pinia'
import useHarvester from '~/stores/useHarvester'
import useProcessor from '~/stores/useProcessor'
import type { TUniqueTiles } from '~/assets/scripts/garden-planner/utils/garden-helpers'

const display = ref<HTMLElement | null>(null)
const isTakingScreenshot = useTakingScreenshot()


const gardenHandler = useGarden()
const harvester = useHarvester()
const processor = useProcessor()
const { isFullUpdateRequested } = storeToRefs(gardenHandler)

watch(isFullUpdateRequested, () => {
  if (isFullUpdateRequested) {
    console.log('Full update requested')
    // Perform full update logic here
    gardenHandler.update()

    if (selectedTab.value === 'garden+display') {
      harvester.simulateYield(gardenHandler.garden.uniqueTiles as TUniqueTiles, harvester.settings)
      processor.simulateProcessing(harvester.totalHarvest)
    }
  }
})

const selectedTab = ref<'garden+display' | 'display+display'>('garden+display')

// Weird bug where if the tab is set to 'display+display', the simulation doesn't run when loading
watchEffect(() => {
  if (isFullUpdateRequested && selectedTab.value === 'display+display') {
    harvester.simulateYield(gardenHandler.garden.uniqueTiles as TUniqueTiles, harvester.settings)
    processor.simulateProcessing(harvester.totalHarvest)
  }
})


</script>

<template>
  <section ref="display">
    <div class="sm:py-1 rounded-t-md sm:px-2 bg-accent">
      <ItemSelector />
      <AppDivider class="order-3 mx-4 my-1 lg:col-span-7 " :class="[isTakingScreenshot.get ? 'col-span-7' : '']" />
      <section class="flex flex-col sm:py-2 gap-y-4 justify-between" :class="[gardenHandler.isGardenWide ? '' : 'lg:flex-row']">
        <section class="h-full" :class="[gardenHandler.isGardenWide ? 'flex flex-col items-center pb-2' : '',
        (selectedTab === 'display+display') ? 'w-full' : ''
        ]">
          <template v-if="(selectedTab === 'garden+display')">
            <NewGardenDisplay />
            <NewStatsDisplay class="pt-2 sm:mx-auto xs:px-2 w-fit "
              :class="[gardenHandler.isGardenWide ? 'w-fit' : 'lg:w-full']" />
          </template>
          <template v-show="(selectedTab === 'display+display')">
            <section class="w-full sm:px-2">
              <div class="h-full sm:rounded-lg bg-primary">
                <OutputDisplay />
              </div>
            </section>
          </template>
        </section>
        <section class="w-full sm:px-2"> 
          <div class="h-full sm:rounded-lg bg-primary">
            <OutputDisplay is-main-output-display
              @tab-changed="(newValue: 'garden+display' | 'display+display') => selectedTab = newValue" />
          </div>
        </section>
      </section>
    </div>
  </section>
</template>