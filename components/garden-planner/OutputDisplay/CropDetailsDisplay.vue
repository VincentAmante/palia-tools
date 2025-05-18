<script setup lang="ts">
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import useHarvester from '~/stores/useHarvester'
import useProcessor from '~/stores/useProcessor'
import { ItemType, parseCropId, type ICropName, type ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { CropType } from '~/assets/scripts/garden-planner/imports'
import { getCropFromType } from '~/assets/scripts/garden-planner/imports'
import ItemDisplay from '../HarvestCalculator/ItemDisplay.vue'

import { formatMinutesToHoursMinutes, formatMinutesToDaysHoursMinutes } from '~/utils/formatters' // Assuming a formatter utility exists or needs creation
import CropCrafterDataDisplay from './CropCrafterDataDisplay.vue'
import CropDetailsOverallDisplay from './CropDetailsOverallDisplay.vue'

const harvester = useHarvester()
const processor = useProcessor()

// --- Crop Details Tab Logic ---
const selectedCropDetail = ref<ICropNameWithGrowthDiff | null>(null)

// Gets cycle detail which relies on selected crop detail
const cycleId = computed(() => {
  if (!selectedCropDetail.value || !harvester.dayHarvests || harvester.dayHarvests.size === 0)
    return ''

  return `${parseCropId(selectedCropDetail.value).type}${harvester.settings.useStarSeeds ? '-Star' : '-Base'}` satisfies ICropName
})

const cropInfo = computed(() => {
  return parseCropId(selectedCropDetail.value || '')
})

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

function selectCropForDetail(cropId: ICropNameWithGrowthDiff) {
  selectedCropDetail.value = cropId
}

// Computed property for selected crop's cycle data
const selectedCropCycleData = computed(() => {
  if (!selectedCropDetail.value || !harvester.harvester.totalHarvest?.cycleData)
    return null

  const { type, hasGrowthBoost } = parseCropId(selectedCropDetail.value)
  const totalHarvestCycleId = `${type}${(harvester.settings.useStarSeeds ? '-Star' : '-Base')}${(harvester.settings.useGrowthBoost && hasGrowthBoost) ? '-Growth' : ''}` satisfies ICropNameWithGrowthDiff

  return harvester.harvester.totalHarvest.cycleData.get(totalHarvestCycleId)
})

// Computed property for selected crop's processing data
const selectedCropProcessingData = computed(() => {

  if (!selectedCropDetail.value || !processor.output?.detailedProcessingInfo)
    return null

  const detailedProcessingInfoOutput = processor.output.detailedProcessingInfo.get(selectedCropDetail.value)


  if (detailedProcessingInfoOutput && detailedProcessingInfoOutput.cycleData.length > 0) {
    return detailedProcessingInfoOutput
  }

  else return null
})



const cropDetailsTab = ref<'overall' | 'crafter-data' | 'day-by-day'>('overall')

// Resets selected crop detail to null if no crop cycle data is available and the selected crop detail is not null
watchEffect(() => {
  if (!selectedCropCycleData.value && selectedCropDetail.value !== null) {
    selectedCropDetail.value = null
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
    <h2 class="text-sm font-semibold text-palia-blue-dark">
      Crop Details
    </h2>

    <!-- Crop Selector -->
    <nav class="flex flex-wrap gap-2 p-2 border rounded-sm border-misc-dark bg-accent">
      <p v-if="presentCrops.size === 0" class="text-sm  text-misc-dark">
        No crops in layout to display details for.
      </p>
      <template v-for="([cropId, data]) in presentCrops" :key="cropId">
        <CropDetailButton :crop="getCropFromType(parseCropId(cropId).type)!" :count="data.count"
          @click="selectCropForDetail(cropId)" :isSelected="cropId === selectedCropDetail" :cropId="cropId" />
      </template>
    </nav>

    <!-- Details Display -->
    <div v-if="selectedCropDetail && selectedCropCycleData" class="py-1 flex flex-col gap-1">
      <div class="flex gap-1 flex-col lg:flex-row  gap-x-4">
        <p class="text-sm font-semibold text-palia-blue-dark flex gap-1 items-center bg-accent px-3 rounded-sm">
          <span class="capitalize font-bold">{{ selectedCropCycleData.cropType }}</span>
          <FontAwesomeIcon v-if="selectedCropDetail.includes('-Star')" :icon="['fas', 'star']"
            class="text-sm text-quality-increase-dark" aria-label="Star Seed" />
          <FontAwesomeIcon v-if="selectedCropDetail.includes('-Growth')" :icon="['fas', 'forward-fast']"
            class="ml-1 text-sm text-growth-boost" title="Growth Boost Applied" aria-label="Growth Boost Applied" />
        </p>
        <div role="tablist" class="tabs tabs-xs tabs-border bg-palia-blue-dark rounded-sm gap-1 w-fit">
          <button role="tab" class="tab bg-transparent" :class="{'tab-active text-accent': cropDetailsTab === 'overall'}" @click="cropDetailsTab = 'overall'" :aria-selected="cropDetailsTab === 'overall'">Summary</button>
          <button v-if="selectedCropProcessingData" role="tab" class="tab bg-transparent" :class="{'tab-active text-accent': cropDetailsTab === 'crafter-data'}" @click="cropDetailsTab = 'crafter-data'" :aria-selected="cropDetailsTab === 'crafter-data'">Crafters</button>
          <button role="tab" class="tab bg-transparent" :class="{'tab-active text-accent': cropDetailsTab === 'day-by-day'}" @click="cropDetailsTab = 'day-by-day'" :aria-selected="cropDetailsTab === 'day-by-day'">Harvest Days</button>
        </div>
      </div>
      <div v-if="cropDetailsTab === 'overall'">
        <CropDetailsOverallDisplay :selected-crop-detail="selectedCropDetail" />
      </div>
      <div v-else-if="selectedCropProcessingData && cropDetailsTab === 'crafter-data'">
        <CropCrafterDataDisplay :selected-crop-processing-data="selectedCropProcessingData"
          :selected-crop-detail="selectedCropDetail" />
      </div>
    </div>
    <div v-else-if="selectedCropDetail" class="mt-2">
      <p class="italic font-bold text-warning" role="alert">
        ERROR: No data available for {{ selectedCropDetail }}...
      </p>
    </div>
    <div v-else class="mt-2">
      <p class="italic text-misc-dark" role="status">
        Select a crop group above to see details.
      </p>
    </div>
  </section>
</template>
