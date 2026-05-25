<script setup lang="ts">
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import useHarvester from '~/stores/useHarvester'
import useProcessor from '~/stores/useProcessor'
import { parseCropId, type ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { type CropType, getCropFromType  } from '~/assets/scripts/garden-planner/imports'


import CropCrafterDataDisplay from './CropCrafterPanel.vue'
import CropSummaryPanel from './CropSummaryPanel.vue'
import CropHarvestDaysPanel from './CropHarvestDaysPanel.vue'
import CropGardenMainDisplay from './CropGardenMainDisplay.vue'
import CropMiscDetails from './CropMiscPanel.vue'

const harvester = useHarvester()
const processor = useProcessor()
const { get: isTakingScreenshot } = storeToRefs(useTakingScreenshot())

// --- Crop Details Tab Logic ---
const selectedCropId = ref<ICropNameWithGrowthDiff | null>(null)

// Gets cycle detail which relies on selected crop detail
// const cycleId = computed(() => {
//   if (!selectedCropId.value || !harvester.dayHarvests || harvester.dayHarvests.size === 0)
//     return ''

//   return `${parseCropId(selectedCropId.value).type}${harvester.settings.useStarSeeds ? '-Star' : '-Base'}` satisfies ICropName
// })

// const cropInfo = computed(() => {
//   return parseCropId(selectedCropId.value || '')
// })

// Get unique crop types present in the harvest, maintaining the growth diff identifier
const presentCrops = computed(() => {
  const cropsMap = new Map<ICropNameWithGrowthDiff, { count: number; cropType: CropType; isStar: boolean; hasGrowthBoost: boolean }>()
  if (!harvester.harvester.totalHarvest?.crops)
    return cropsMap

  for (const [cropId, data] of harvester.harvester.totalHarvest.crops) {
    if (data.totalRaw > 0) { // Only show crops that were actually harvested
      const { type, isStar, hasGrowthBoost } = parseCropId(cropId)
      const existing = cropsMap.get(cropId) || { count: 0, cropType: type, isStar, hasGrowthBoost }
      existing.count += data.totalWithDeductions
      cropsMap.set(cropId, existing)
    }
  }

  // Sort alphabetically, maybe group by type later if needed
  return new Map([...cropsMap.entries()].sort(([keyA], [keyB]) => keyA.localeCompare(keyB)))
})

function selectCropForDetail(cropId: ICropNameWithGrowthDiff | null) {
  selectedCropId.value = cropId
}

// Computed property for selected crop's cycle data
const selectedCropCycleData = computed(() => {
  if (!selectedCropId.value || !harvester.harvester.totalHarvest?.cycleData)
    return null

  const { type, hasGrowthBoost } = parseCropId(selectedCropId.value)
  const totalHarvestCycleId = `${type}${(harvester.settings.useStarSeeds ? '-Star' : '-Base')}${(harvester.settings.useGrowthBoost && hasGrowthBoost) ? '-Growth' : ''}` satisfies ICropNameWithGrowthDiff

  return harvester.harvester.totalHarvest.cycleData.get(totalHarvestCycleId)
})

// Computed property for selected crop's processing data
const selectedCropProcessingData = computed(() => {

  if (!selectedCropId.value || !processor.output?.detailedProcessingInfo)
    return null

  const detailedProcessingInfoOutput = processor.output.detailedProcessingInfo.get(selectedCropId.value)


  if (detailedProcessingInfoOutput && detailedProcessingInfoOutput.cycleData.length > 0) {
    return detailedProcessingInfoOutput
  }

  else return null
})



const cropDetailsTab = ref<'overall' | 'crafter-data' | 'day-by-day' | 'misc'>('overall')

// Resets selected crop detail to null if no crop cycle data is available and the selected crop detail is not null
watchEffect(() => {
  if (!selectedCropCycleData.value && selectedCropId.value !== null) {
    selectedCropId.value = null
  }
})

// Resets crop details tab to 'overall' if no processing data is available and the tab is set to 'crafter-data'
watchEffect(() => {
  if (!selectedCropProcessingData.value && cropDetailsTab.value === 'crafter-data') {
    cropDetailsTab.value = 'overall'
  }
})
</script>
<template>
  <section class="flex flex-col gap-1 pt-1 text-palia-blue-dark">
    <h2 class="text-sm font-semibold text-palia-blue-dark dark:text-accent">
      Crop Details
    </h2>

    <!-- Crop Selector -->
    <nav
      class="flex flex-wrap scrollbar-h-2 gap-1 p-1 border rounded-sm border-misc-dark bg-accent dark:bg-palia-blue-light dark:border-palia-blue">
      <p v-if="presentCrops.size === 0" class="text px-2 py-3 text-sm lg:text-base  text-misc-dark dark:text-accent">
        No crops in layout to display details for.
      </p>
      <button
v-if="presentCrops.size > 0" class="relative border rounded-xs btn btn-lg btn-square btn-secondary isolate border-misc dark:bg-palia-blue dark:border-palia-blue-dark text-harvest-boost tooltip"
        :class="(selectedCropId === null && !isTakingScreenshot) ? 'bg-white' : ''"
        data-tip="All harvests" @click="selectCropForDetail(null)">
        <FontAwesomeIcon :icon="['fas', 'wheat-awn']" />
      </button>
      <template v-for="([cropId, data]) in presentCrops" :key="cropId">
        <CropDetailButton
:crop="getCropFromType(parseCropId(cropId).type)!" :count="data.count"
          :is-selected="cropId === selectedCropId" :crop-id="cropId" @click="selectCropForDetail(cropId)" />
      </template>
    </nav>

    <!-- Details Display -->
    <div v-if="selectedCropId && selectedCropCycleData" class="py-1 flex flex-col gap-2 @container">
      <div class="flex gap-1 flex-col lg:flex-row  gap-x-4">
        <p
          class="text-sm w-fit font-semibold text-palia-blue-dark flex gap-1 items-center bg-accent dark:bg-palia-blue-light dark:text-accent px-3 rounded-sm">
          <span class="capitalize font-bold">{{ selectedCropCycleData.cropType }}</span>
          <FontAwesomeIcon
v-if="selectedCropId.includes('-Star')" :icon="['fas', 'star']"
            class="text-sm text-quality-increase-dark dark:text-quality-increase" aria-label="Star Seed" />
          <FontAwesomeIcon
v-if="selectedCropId.includes('-Growth')" :icon="['fas', 'forward-fast']"
            class="ml-1 text-sm text-growth-boost" title="Growth Boost Applied" aria-label="Growth Boost Applied" />
        </p>
        <div role="tablist" class="tabs tabs-xs tabs-border bg-palia-blue-dark rounded-sm gap-1 w-fit">
          <button
role="tab" class="tab bg-transparent"
            :class="{ 'tab-active text-accent': cropDetailsTab === 'overall' }" :aria-selected="cropDetailsTab === 'overall'"
            @click="cropDetailsTab = 'overall'">Summary</button>
          <button
v-if="selectedCropProcessingData" role="tab" class="tab bg-transparent"
            :class="{ 'tab-active text-accent': cropDetailsTab === 'crafter-data' }"
            :aria-selected="cropDetailsTab === 'crafter-data'"
            @click="cropDetailsTab = 'crafter-data'">Crafters</button>
          <button
role="tab" class="tab bg-transparent"
            :class="{ 'tab-active text-accent': cropDetailsTab === 'day-by-day' }"
            :aria-selected="cropDetailsTab === 'day-by-day'" @click="cropDetailsTab = 'day-by-day'">Harvest
            Days</button>
          <button
role="tab" class="tab bg-transparent" :class="{ 'tab-active text-accent': cropDetailsTab === 'misc' }"
            :aria-selected="cropDetailsTab === 'misc'" @click="cropDetailsTab = 'misc'">Misc</button>
        </div>
      </div>
      <div v-if="cropDetailsTab === 'overall'">
        <CropSummaryPanel :selected-crop-detail="selectedCropId" />
      </div>
      <div v-else-if="selectedCropProcessingData && cropDetailsTab === 'crafter-data'">
        <CropCrafterDataDisplay
:selected-crop-processing-data="selectedCropProcessingData"
          :selected-crop-detail="selectedCropId" />
      </div>
      <div v-else-if="cropDetailsTab === 'day-by-day'" class="">
        <CropHarvestDaysPanel :crop-to-filter="selectedCropId" />
      </div>
      <div v-else-if="cropDetailsTab === 'misc'" class="">
        <CropMiscDetails :crop-type="selectedCropCycleData.cropType" :crop-id="selectedCropId" />
      </div>
    </div>
    <div v-else-if="selectedCropId" class="mt-1">
      <p class="italic font-bold text-warning" role="alert">
        ERROR: No data available for {{ selectedCropId }}...
      </p>
    </div>
    <div v-else class="">
      <CropGardenMainDisplay />
    </div>
  </section>
</template>
