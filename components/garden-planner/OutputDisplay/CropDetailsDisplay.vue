<script setup lang="ts">
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import useHarvester from '~/stores/useHarvester'
import useProcessor from '~/stores/useProcessor'
import { parseCropId, type ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import type { CropType } from '~/assets/scripts/garden-planner/imports'
import { getCropFromType } from '~/assets/scripts/garden-planner/imports'

import { formatMinutesToHoursMinutes } from '~/utils/formatters' // Assuming a formatter utility exists or needs creation

const harvester = useHarvester()
const processor = useProcessor()

// --- Crop Details Tab Logic ---
const selectedCropDetail = ref<ICropNameWithGrowthDiff | null>(null)

// Get unique crop types present in the harvest, maintaining the growth diff identifier
const presentCrops = computed(() => {
  const cropsMap = new Map<ICropNameWithGrowthDiff, { count: number; cropType: CropType; isStar: boolean; hasGrowthBoost: boolean }>()
  if (!harvester.totalHarvest?.crops)
    return cropsMap

  for (const [cropId, data] of harvester.totalHarvest.crops) {
    if (data.totalRaw > 0) { // Only show crops that were actually harvested
      const { type, isStar, hasGrowthBoost } = parseCropId(cropId)
      const existing = cropsMap.get(cropId) || { count: 0, cropType: type, isStar, hasGrowthBoost }
      existing.count += data.totalRaw // Use totalRaw for display count before deductions? Or totalWithDeductions? Let's use totalRaw for now.
      cropsMap.set(cropId, existing)
    }
  }
  // Sort alphabetically, maybe group by type later if needed
  return new Map([...cropsMap.entries()].sort(([keyA], [keyB]) => keyA.localeCompare(keyB)))
})

function selectCropForDetail(cropId: ICropNameWithGrowthDiff) {
  selectedCropDetail.value = cropId
}

// Helper to get crop object for display
function getCropInfoForDetail(cropId: ICropNameWithGrowthDiff | null) {
  if (!cropId)
    return null

  const { type } = parseCropId(cropId)
  return getCropFromType(type)
}

// Computed property for selected crop's cycle data
const selectedCropCycleData = computed(() => {
  if (!selectedCropDetail.value || !harvester.totalHarvest?.cycleData)
    return null

  const { type, hasGrowthBoost } = parseCropId(selectedCropDetail.value)
  const totalHarvestCycleId = `${type}${(harvester.settings.useStarSeeds ? '-Star' : '-Base')}${(harvester.settings.useGrowthBoost && hasGrowthBoost) ? '-Growth' : ''}` satisfies ICropNameWithGrowthDiff
  return harvester.totalHarvest.cycleData.get(totalHarvestCycleId)
})

// Computed property for selected crop's processing data
const selectedCropProcessingData = computed(() => {

  if (!selectedCropDetail.value || !processor.output?.detailedProcessingInfo)
    return null

  const detailedProcessingInfoOutput = processor.output.detailedProcessingInfo.get(selectedCropDetail.value)

  if (detailedProcessingInfoOutput && detailedProcessingInfoOutput.length > 0) {

    return detailedProcessingInfoOutput[0]
  }


  else return null
})

// Computed property for seeds required per replant event
const selectedCropSeedsRequiredPerHarvest = computed(() => {
  if (!selectedCropDetail.value || !harvester.dayHarvests || harvester.dayHarvests.size === 0)
    return null

  // Find the first day harvest that requires this specific seed type
  for (const [, dayHarvest] of harvester.dayHarvests) {
    if (dayHarvest.seedsRequired.has(selectedCropDetail.value))
      return dayHarvest.seedsRequired.get(selectedCropDetail.value)
  }
  return null // No replanting occurred or required for this specific type
})

// Computed property for total seeds required over the simulation
const selectedCropTotalSeedsRequired = computed(() => {
  if (!selectedCropDetail.value || !harvester.dayHarvests || harvester.dayHarvests.size === 0)
    return 0

  let total = 0
  for (const [, dayHarvest] of harvester.dayHarvests) {
    if (dayHarvest.seedsRequired.has(selectedCropDetail.value))
      total += dayHarvest.seedsRequired.get(selectedCropDetail.value)?.count || 0
  }
  return total
})

// Computed property for cycle duration
const selectedCropCycleDuration = computed(() => {
  if (!selectedCropCycleData.value)
    return 0
  return selectedCropCycleData.value.phases.reduce((sum, phase) => sum + phase.phaseLength, 0)
})

// Computed property for total full cycles
const selectedCropTotalFullCycles = computed(() => {
  if (!selectedCropCycleData.value || selectedCropCycleData.value.phases.length === 0)
    return 0
  return Math.floor(selectedCropCycleData.value.totalHarvestsCount / selectedCropCycleData.value.phases.length)
})

// --- End Crop Details Tab Logic ---
</script>
<template>
  <section class="flex flex-col gap-2 pt-1 text-palia-blue-dark">
    <p class="text-lg font-semibold text-palia-blue-dark">
      Crop Details
    </p>

    <!-- Crop Selector -->
    <div class="flex flex-wrap gap-2 p-2 border rounded border-misc-dark bg-accent">
      <p v-if="presentCrops.size === 0" class="text-sm italic text-misc-dark">
        No crops in layout to display details for.
      </p>
      <button v-for="([cropId, data]) in presentCrops" :key="cropId"
        class="relative h-auto p-1 border rounded-md btn btn-sm border-misc hover:border-palia-blue focus:border-palia-blue focus:ring-2 focus:ring-palia-blue focus:outline-none"
        :class="{ 'ring-2 ring-palia-blue border-palia-blue': selectedCropDetail === cropId }"
        @click="selectCropForDetail(cropId)">
        <div class="flex items-center gap-1">
          <img :src="getCropInfoForDetail(cropId)?.image" :alt="data.cropType" class="object-contain w-6 h-6" width="24"
            height="24" :srcset="undefined" format="webp">
          <span class="text-xs font-semibold">
            {{ data.cropType }}
            <FontAwesomeIcon v-if="data.isStar" :icon="['fas', 'star']" class="text-xs text-yellow-400" />
            <FontAwesomeIcon v-if="data.hasGrowthBoost" :icon="['fas', 'forward-fast']"
              class="ml-1 text-xs text-growth-boost" title="Growth Boost Applied" />
          </span>
        </div>
        <span
          class="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-xs font-semibold text-white rounded-full bg-palia-blue-dark min-w-[1rem] h-[1rem] flex items-center justify-center">
          {{ data.count }}
        </span>
      </button>
    </div>

    <!-- Details Display -->
    <div v-if="selectedCropDetail && selectedCropCycleData" class="mt-2 space-y-3">
      <h4 class="text-base font-semibold text-palia-blue">
        Details for: {{ selectedCropCycleData.cropType }}
        <FontAwesomeIcon v-if="selectedCropDetail.includes('-Star')" :icon="['fas', 'star']"
          class="text-sm text-yellow-400" />
        <FontAwesomeIcon v-if="selectedCropDetail.includes('-Growth')" :icon="['fas', 'forward-fast']"
          class="ml-1 text-sm text-growth-boost" title="Growth Boost Applied" />
      </h4>

      <!-- Cycle Info -->
      <div class="p-2 border rounded border-misc-dark bg-accent">
        <p class="mb-1 text-sm font-medium text-palia-blue-dark">
          Harvest Cycle
        </p>
        <div class="flex flex-wrap gap-1 text-sm">
          <p class="font-semibold badge">{{ selectedCropCycleData.phases.length }}
            <span class="">&nbsp;Harvest<template v-if="selectedCropCycleData.phases.length > 1">s</template></span>
            &nbsp;/&nbsp;
            {{ selectedCropCycleDuration }} Days
          </p>
          <p class="font-semibold badge">{{ selectedCropTotalFullCycles }} Cycle<template
              v-if="selectedCropTotalFullCycles > 1">s</template></p>
          <p v-if="selectedCropTotalFullCycles !== selectedCropCycleData.totalHarvestsCount"
            class="font-semibold badge">
            {{ selectedCropCycleData.totalHarvestsCount }} Total Harvests</p>
          <!-- <p class="font-semibold badge" v-if="selectedCropSeedsRequiredPerHarvest">
        <span class="font-semibold">Seeds per Replant:</span>&nbsp;{{ selectedCropSeedsRequiredPerHarvest.count }}
      </p>
      <p class="font-semibold badge" v-else>
        <span class="font-semibold">Seeds per Replant:</span>&nbsp;N/A
      </p>
      <p v-if="(selectedCropSeedsRequiredPerHarvest?.count || 0) !== selectedCropTotalSeedsRequired" class="font-semibold badge"><span class="font-semibold">Total Seeds Used:</span>&nbsp;{{ selectedCropTotalSeedsRequired }}</p> -->
        </div>
      </div>

      <!-- Processing Info -->
      <div v-if="selectedCropProcessingData && selectedCropProcessingData.cycleCrafterData.length > 0"
        class="p-2 border rounded border-misc-dark bg-accent">
        <p class="mb-1 text-sm font-medium ">
          Processing Details
          <!-- ({{ processor.output[selectedCropProcessingData[0].processInto === 'seed' ? 'seeds' : 'preserves'].get(selectedCropDetail)?.itemType }}) -->
        </p>
        <div v-for="(phaseData, phaseIndex) in selectedCropProcessingData.cycleCrafterData"
          :key="`cycle-1-hase-${phaseIndex}`" class="pl-2 mb-2 border-l-2 border-palia-blue-dark">
          <p class="text-xs font-medium">
            Phase {{ phaseIndex + 1 }} ({{ phaseData.crafterData.length }} Crafters)
          </p>
          <p class="text-xs">
            <span class="font-semibold">Longest Time:</span> {{
              formatMinutesToHoursMinutes(phaseData.longestProcessMinutes) }} ({{
              formatMinutesToHoursMinutes(phaseData.longestProcessMinutesNoIdle) }} active)
          </p>
          <div class="mt-1 overflow-x-auto">
            <table class="w-full text-xs border-collapse">
              <thead>
                <tr class="bg-opacity-50 bg-misc">
                  <th class="p-1 font-semibold border border-misc-dark">
                    Crafter #
                  </th>
                  <th class="p-1 font-semibold border border-misc-dark">
                    Crops In
                  </th>
                  <th class="p-1 font-semibold border border-misc-dark">
                    Processes
                  </th>
                  <th class="p-1 font-semibold border border-misc-dark">
                    Time
                  </th>
                  <th class="p-1 font-semibold border border-misc-dark">
                    Idle
                  </th>
                  <th class="p-1 font-semibold border border-misc-dark">
                    Excess
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(crafter, crafterIndex) in phaseData.crafterData" :key="`crafter-${crafterIndex}`">
                  <td class="p-1 text-center border border-misc-dark">
                    {{ crafterIndex + 1 }}
                  </td>
                  <td class="p-1 text-right border border-misc-dark">
                    {{ crafter.cropsInsertedCount.toLocaleString() }}
                  </td>
                  <td class="p-1 text-right border border-misc-dark">
                    {{ crafter.processesDone.toLocaleString(undefined, { maximumFractionDigits: 1 }) }}
                  </td>
                  <td class="p-1 text-right border border-misc-dark">
                    {{ formatMinutesToHoursMinutes(crafter.processTimeMinutes) }}
                  </td>
                  <td class="p-1 text-right border border-misc-dark">
                    {{ formatMinutesToHoursMinutes(crafter.idleTimeMinutes) }}
                  </td>
                  <td class="p-1 text-right border border-misc-dark">
                    {{ formatMinutesToHoursMinutes(crafter.excessTimeMinutes) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- <div v-for="(cycle, cycleIndex) in selectedCropProcessingData" :key="`cycle-${cycleIndex}`"
      class="pb-2 mb-3 border-b border-misc last:border-b-0 last:mb-0">
      <p class="mb-1 text-xs font-semibold">
        Cycle {{ cycleIndex + 1 }} {{ cycleIndex >= selectedCropTotalFullCycles ? '(Partial)' : '' }}
      </p>

    </div> -->
      </div>
      <div v-else-if="selectedCropProcessingData === null || selectedCropProcessingData.cycleCrafterData === undefined"
        class="p-2 border rounded border-misc-dark bg-accent">
        <p class="text-sm italic text-misc-dark">
          This crop group was not processed.
        </p>
      </div>
    </div>
    <div v-else-if="selectedCropDetail" class="mt-2">
      <p class="italic text-misc-dark">
        Loading details or no data available for {{ selectedCropDetail }}...
      </p>
    </div>
    <div v-else class="mt-2">
      <p class="italic text-misc-dark">
        Select a crop group above to see details.
      </p>
    </div>
  </section>
</template>