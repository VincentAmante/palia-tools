<script setup lang="ts">
import StatsDisplay from './garden-planner/StatsDisplay.vue'
import OutputDisplay from './garden-planner/OutputDisplay.vue'
import ItemSelector from '~/components/garden-planner/ItemSelector/ItemSelector.vue'
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import { storeToRefs } from 'pinia'
import useHarvester from '~/stores/useHarvester'
import type { ITotalHarvest, TUniqueTiles } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { useSettingsCode } from '~/stores/useSettingsCode'
import { ItemType } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { getCropFromType } from '~/assets/scripts/garden-planner/imports'
import AppDivider from './AppDivider.vue'
import GridGardenDisplay from './garden-planner/GridGardenDisplay.vue'
import { loadSettings, saveSettings } from '~/assets/scripts/garden-planner/save-handler.js'

import { usePlannerDisplayConfig } from '~/stores/usePlannerDisplayConfig'

import { watch } from 'vue'

const isTakingScreenshot = useTakingScreenshot()
const harvester = useHarvester()
const harvesterSettings = useHarvesterSettings()
const processor = useProcessor()
const processorSettings = useProcessorSettings()
const plannerDisplayConfig = usePlannerDisplayConfig()

const garden = useGardenGrid()
const settingsCode = useSettingsCode()
const saveCode = useSaveCode()

watch(
  () => settingsCode.code,
  (newSettingsCode) => {
    saveCode.set(garden.saveGarden(newSettingsCode))
  }
)

let harvesterDebounceTimer: ReturnType<typeof setTimeout>

watch(
  [() => harvesterSettings.settings, () => garden.analyser.uniqueTiles],
  () => {
    clearTimeout(harvesterDebounceTimer)
      console.log('updating harvest', new Date().toLocaleTimeString())
    harvesterDebounceTimer = setTimeout(() => {
      harvester.simulateYield(garden.analyser.uniqueTiles, harvesterSettings.settings)
    }, 20)
  },
  { deep: true }
)

function loadGarden(saveString: string) {
  const { harvesterOptions, processorSettings: loadedProcessorSettings } = loadSettings(saveString)
  harvesterSettings.updateSettings(Object.assign({}, harvesterOptions))
  processorSettings.updateSettings(Object.assign({}, loadedProcessorSettings))
}
watch(
  () => harvester.totalHarvest.crops,
  (cropHarvests) => {
    for (const setting of processorSettings.settings.cropSettings.values()) {
      setting.isActive = false
    }

    for (const [cropId, data] of cropHarvests) {
      let cropSetting = processorSettings.settings.cropSettings.get(cropId)

      if (!cropSetting) {
        cropSetting = {
          count: data.totalWithDeductions,
          cropType: data.cropType,
          isStar: data.isStar,
          processAs: ItemType.Crop,
          crafters: 1,
          targetTime: 0,
          isActive: true,
          hasPreserve: (getCropFromType(data.cropType)?.conversionInfo.preserveProcessMinutes || 0) > 0,
        }
      } else {
        cropSetting.count = data.totalWithDeductions
        cropSetting.isActive = true
      }

      processorSettings.settings.cropSettings.set(cropId, cropSetting)
    }
  },
  { deep: true, immediate: true }
)

let processorDebounceTimer: ReturnType<typeof setTimeout>
watch(
  [
    () => processorSettings.settings,
    () => garden.analyser.fertiliserCountByType,
    () => harvester.totalHarvest
  ],
  () => {
    clearTimeout(processorDebounceTimer)

    processorDebounceTimer = setTimeout(() => {
      processor.simulateProcessing(harvester.totalHarvest as Readonly<ITotalHarvest>, {
        fertiliserCountsByType: garden.analyser.fertiliserCountByType
      })

      const saveString = saveSettings(harvesterSettings.settings, processor.settingsForEncoding)
      settingsCode.set(saveString)
    }, 30) // set it to run "after" harvester yield sim
  },
  { deep: true }
)

const { updateIsRequested } = storeToRefs(settingsCode)

watch(updateIsRequested, () => {
  if (updateIsRequested.value) {
    loadGarden(settingsCode.code)
    settingsCode.resetUpdateRequest()
  }
})
</script>

<template>
  <section id="garden-planner" ref="display" class="@container">
    <div class="sm:py-1 rounded-t-md sm:px-2 bg-accent dark:bg-palia-blue-dark">
      <ItemSelector />
      <AppDivider class="order-3 mx-4 my-1 @:col-span-7 " :class="[isTakingScreenshot.get ? 'col-span-7' : '']" />
      <section
class="flex @sm:py-2 gap-y-2 justify-between" :class="{
        'flex-col lg:flex-row': !garden.isGardenWide,
        'flex-col': (garden.isGardenWide),
        'items-center': (garden.isGardenWide && !isTakingScreenshot.get),
      }">
        <section
class="h-full" :class="{
          'w-full': (plannerDisplayConfig.get === 'display+display'),
          'flex flex-col pb-2': (garden.isGardenWide),
          'items-center': (garden.isGardenWide && !isTakingScreenshot.get),
          'items-start': (garden.isGardenWide && isTakingScreenshot.get)
        }">
          <template v-if="(plannerDisplayConfig.get === 'garden+display')">
            <GridGardenDisplay />
            <StatsDisplay
class="pt-2 @sm:mx-auto"
              :class="[garden.isGardenWide && !isTakingScreenshot.get ? 'w-fit' : '@lg:w-full']" />
          </template>
          <template v-if="(plannerDisplayConfig.get === 'display+display')">
            <section class="w-full max-w-7xl">
              <div class="h-full @sm:rounded-lg bg-primary dark:bg-palia-blue-secondary">
                <OutputDisplay />
              </div>
            </section>
          </template>
        </section>
        <section class="w-full max-w-7xl" :class="{ 'sm:px-2': !garden.isGardenWide }">
          <div class="h-full sm:rounded-lg bg-primary dark:bg-palia-blue-secondary">
            <OutputDisplay is-main-output-display />
          </div>
        </section>
      </section>
    </div>
    <div
v-show="isTakingScreenshot.get" id="watermark" aria-label="hidden"
      class="grid justify-between order-8 w-full px-4 lg:col-span-4 bg-palia-blue rounded-b-md" :class="{
        'grid-cols-2': (!garden.isGardenWide)
      }">
      <div class="flex items-center w-full gap-2 p-2 text-right rounded-md leading-1">
        <img
format="webp" src="https://pgp-cdn.b-cdn.net/logo.webp" width="48px" height="48px" class="max-w-16"
          alt="Palia Garden Planner Logo">
        <div class="flex flex-col items-start justify-start w-full text-left text-primary flex-nowrap ws-nowrap">
          <p class="w-full text-2xl font-bold">
            Palia Garden Planner
          </p>
          <p class="py-2 flex-nowrap ws-nowrap">
            https://palia-garden-planner.vercel.app
          </p>
        </div>
      </div>
      <div class="flex p-2 text-accent" :class="{ 'items-end justify-end': !garden.isGardenWide }">
        <p class="text-xs opacity-70 max-w-160 font-mono" :class="{ 'text-right': !garden.isGardenWide }">{{
          saveCode.code
        }}
        </p>
      </div>
    </div>
  </section>
</template>