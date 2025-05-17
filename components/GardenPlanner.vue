<script setup lang="ts">
import NewGardenDisplay from './garden-planner/NewGardenDisplay.vue'
import NewStatsDisplay from './garden-planner/NewStatsDisplay.vue'
import OutputDisplay from './garden-planner/OutputDisplay.vue'
import ItemSelector from '~/components/garden-planner/ItemSelector/ItemSelector.vue'
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import useGarden from '~/stores/useGarden'
import { storeToRefs } from 'pinia'
import useHarvester from '~/stores/useHarvester'
import type { TUniqueTiles } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { useSettingsCode } from '~/stores/useSettingsCode'
import { ItemType } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { getCropFromType } from '~/assets/scripts/garden-planner/imports'
const display = ref<HTMLElement | null>(null)
const isTakingScreenshot = useTakingScreenshot()
const gardenHandler = useGarden()
const harvester = useHarvester()
const processor = useProcessor()

watchEffect(() => {
  gardenHandler.update()
  harvester.harvester.simulateYield(gardenHandler.garden.uniqueTiles as TUniqueTiles, harvester.settings)
  processor.simulateProcessing(harvester.totalHarvest)
})

const garden = useGarden()
const settingsCode = useSettingsCode()
const saveCode = useSaveCode()


const starBaseChance = ref(0.25 + (harvester.settings.useStarSeeds ? 0.25 : 0) + (harvester.settings.level * 0.02))

watchEffect(() => {
  if (harvester.settings.level < 0)
    harvester.settings.level = 0

  starBaseChance.value = 0.25 + (harvester.settings.useStarSeeds ? 0.25 : 0) + (harvester.settings.level * 0.02)

  starBaseChance.value = Math.min(1, starBaseChance.value)

  if (harvester.settings.days === 'L')
    harvester.settings.days = -1
  else if (harvester.settings.days === 'M')
    harvester.settings.days = 0
  else if (harvester.settings.days < -1)
    harvester.settings.days = -1

  harvester.updateSettings({ ...harvester.settings })
})


function saveGarden() {
  const saveString = garden.garden.saveSettings(harvester.settings, processor.settings)
  settingsCode.set(saveString)
}

function loadGarden(saveString: string) {
  const { harvesterOptions, processorSettings: loadedProcessorSettings } = garden.garden.loadSettings(saveString)

  harvester.updateSettings(Object.assign({}, harvesterOptions))
  processor.updateSettings(Object.assign({}, loadedProcessorSettings))
  processor.simulateProcessing(harvester.totalHarvest)
}


watchEffect(() => {
  // set all isActive to false
  for (const setting of processor.settings.cropSettings.values())
    setting.isActive = false

  for (const [cropId, data] of harvester.totalHarvest.crops) {
    const cropSetting = processor.settings.cropSettings.get(cropId) ?? {
      count: data.totalWithDeductions,
      cropType: data.cropType,
      isStar: data.isStar,
      processAs: ItemType.Crop,
      crafters: 1,
      targetTime: 0,
      isActive: true,
      hasPreserve: (getCropFromType(data.cropType)?.conversionInfo.preserveProcessMinutes || 0) > 0,
    }

    cropSetting.count = data.totalWithDeductions

    processor.settings.cropSettings.set(cropId, cropSetting)

    processor.settings.cropSettings.get(cropId)!.isActive = true
  }

  saveGarden()
})

const { updateIsRequested } = storeToRefs(settingsCode)

watch(updateIsRequested, () => {
  if (updateIsRequested.value) {
    loadGarden(settingsCode.code)
    settingsCode.resetUpdateRequest()
  }
})

const selectedTab = ref<'garden+display' | 'display+display'>('garden+display')

</script>

<template>
  <section ref="display" id="garden-planner" class="@container">
    <div class="sm:py-1 rounded-t-md sm:px-2 bg-accent">
      <ItemSelector />
      <AppDivider class="order-3 mx-4 my-1 @:col-span-7 " :class="[isTakingScreenshot.get ? 'col-span-7' : '']" />
      <section class="flex @sm:py-2 gap-y-2 justify-between"
        :class="{ '@lg:flex-row': !garden.isGardenWide, 'flex-col': !isTakingScreenshot.get }">
        <section class="h-full" :class="[gardenHandler.isGardenWide ? 'flex flex-col items-center pb-2' : '',
        (selectedTab === 'display+display') ? 'w-full' : ''
        ]">
          <template v-if="(selectedTab === 'garden+display')">
            <NewGardenDisplay />
            <NewStatsDisplay class="pt-2 @sm:mx-auto @xs:px-2 w-fit "
              :class="[gardenHandler.isGardenWide ? 'w-fit' : '@lg:w-full']" />
          </template>
          <template v-if="(selectedTab === 'display+display')">
            <section class="w-full">
              <div class="h-full @sm:rounded-lg bg-primary">
                <OutputDisplay />
              </div>
            </section>
          </template>
        </section>
        <section class="w-full sm:px-2">
          <div class="h-full sm:rounded-lg bg-primary">
            <OutputDisplay is-main-output-display @tab-changed="(newValue: 'garden+display' | 'display+display') => {
              if (selectedTab !== newValue) {
                selectedTab = newValue
              }
            }" />
          </div>
        </section>
      </section>
    </div>
    <div v-if="isTakingScreenshot.get" id="watermark" aria-label="hidden"
      class="grid grid-cols-2 justify-between order-8 w-full px-4 lg:col-span-4 bg-palia-blue" :class="[]">
      <div class="flex items-center w-full gap-2 p-2 text-right rounded-md leading-1">
        <img format="webp" src="/logo.webp" width="48px" height="48px" class="max-w-[4rem]" alt="Palia Garden Planner Logo">
        <div class="flex flex-col items-start justify-start w-full text-left text-primary flex-nowrap ws-nowrap">
          <p class="w-full text-2xl font-bold">
            Palia Garden Planner
          </p>
          <p class="py-2 flex-nowrap ws-nowrap">
            https://palia-garden-planner.vercel.app
          </p>
        </div>
      </div>
      <div class="flex items-end p-2 text-accent">
        <p class="text-xs text-right opacity-40">{{ saveCode.code }}</p>
      </div>
    </div>
  </section>
</template>