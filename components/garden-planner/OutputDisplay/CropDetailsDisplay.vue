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

const selectedCropIsProcessedAs = computed(() => {
  if (!selectedCropDetail.value) {
    return null
  }

  return processor.settings.cropSettings.get(selectedCropDetail.value satisfies ICropNameWithGrowthDiff)?.processAs
})

const canFinishBeforeNextHarvest = computed(() => {
  if (!selectedCropDetail.value || !processor.output?.detailedProcessingInfo)
    return null

  const detailedProcessingInfoOutput = processor.output.detailedProcessingInfo.get(selectedCropDetail.value)?.cycleData

  let canFinishBeforeNextHarvest = true

  if (detailedProcessingInfoOutput) {
    for (const detailedProcessingInfo of detailedProcessingInfoOutput) {
      for (const crafter of detailedProcessingInfo.cycleCrafterData) {
        if (!crafter.canFinishBeforeNextHarvest)
          canFinishBeforeNextHarvest = false
      }
    }

    return canFinishBeforeNextHarvest
  }
})

// Computed property for seeds required per replant event
const selectedCropSeedsRequiredPerHarvest = computed(() => {
  if (!selectedCropDetail.value || !harvester.dayHarvests || harvester.dayHarvests.size === 0 || !cycleId.value)
    return null

  // Find the first day harvest that requires this specific seed type
  for (const [, dayHarvest] of harvester.dayHarvests) {
    if (dayHarvest.seedsRequired.has(cycleId.value))
      return dayHarvest.seedsRequired.get(cycleId.value)
  }
  return null // No replanting occurred or required for this specific type
})

// Computed property for total seeds required over the simulation
const selectedCropTotalSeedsRequired = computed(() => {
  if (!selectedCropDetail.value || !harvester.dayHarvests || harvester.dayHarvests.size === 0 || !cycleId.value)
    return 0

  let total = 0
  for (const [, dayHarvest] of harvester.dayHarvests) {
    if (dayHarvest.seedsRequired.has(cycleId.value))
      total += dayHarvest.seedsRequired.get(cycleId.value)?.count || 0
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

const selectedCropAsCrop = computed(() => {
  if (!selectedCropDetail.value) {
    return getCropFromType(CropType.None)
  }

  return getCropFromType(parseCropId(selectedCropDetail.value).type)
})


const cropDetailsProcessTab = ref<'overall' | 'cycle-data'>('overall')
const cropDetailCycleIndex = ref(0)
const lastVisitedCropDetail = ref(`none`)
const cropDetailCyclePhase = ref(0)

watchEffect(() => {
  if (`${selectedCropDetail}` !== lastVisitedCropDetail.value) {
    cropDetailCyclePhase.value = 0

    lastVisitedCropDetail.value = selectedCropDetail.value || ''
  }
})

watchEffect(() => {
  if (!selectedCropCycleData.value && selectedCropDetail.value !== null) {
    selectedCropDetail.value = null
  }
})

// --- End Crop Details Tab Logic ---
</script>
<template>
  <section class="flex flex-col gap-1 pt-1 text-palia-blue-dark">
    <p class="text-sm font-semibold text-palia-blue-dark">
      Crop Details
    </p>

    <!-- Crop Selector -->
    <div class="flex flex-wrap gap-2 p-2 border rounded-sm border-misc-dark bg-accent">
      <p v-if="presentCrops.size === 0" class="text-sm  text-misc-dark">
        No crops in layout to display details for.
      </p>
      <template v-for="([cropId, data]) in presentCrops" :key="cropId">
        <CropDetailButton :crop="getCropFromType(parseCropId(cropId).type)!" :count="data.count"
          @click="selectCropForDetail(cropId)" :isSelected="cropId === selectedCropDetail" :cropId="cropId" />
      </template>
    </div>

    <!-- Details Display -->
    <div v-if="selectedCropDetail && selectedCropCycleData" class="py-1 flex flex-col gap-1">
      <p class="text-sm font-semibold text-palia-blue flex gap-1 items-center">
        Details for: <span class="capitalize">{{ selectedCropCycleData.cropType }}</span>
        <FontAwesomeIcon v-if="selectedCropDetail.includes('-Star')" :icon="['fas', 'star']"
          class="text-sm text-quality-increase-dark" />
        <FontAwesomeIcon v-if="selectedCropDetail.includes('-Growth')" :icon="['fas', 'forward-fast']"
          class="ml-1 text-sm text-growth-boost" title="Growth Boost Applied" />
      </p>

      <!-- Cycle Info -->
      <div class="p-2 border rounded-sm border-misc-dark bg-accent">
        <div class="flex flex-col gap-1">
          <div class="flex flex-wrap gap-1 text-sm">
            <p class="font-semibold badge badge-sm">{{ selectedCropCycleData.phases.length }}<span
                class="">Harvest<template v-if="selectedCropCycleData.phases.length > 1">s</template></span>/ {{
                  selectedCropCycleDuration }} Days
            </p>
            <p class="font-semibold badge badge-sm">{{ selectedCropTotalFullCycles }} Cycle<template
                v-if="selectedCropTotalFullCycles > 1">s</template></p>
            <p v-if="selectedCropTotalFullCycles !== selectedCropCycleData.totalHarvestsCount"
              class="font-semibold badge badge-sm">
              {{ selectedCropCycleData.totalHarvestsCount }} Total Harvests</p>
            <p class="font-semibold badge badge-sm"
              v-if="selectedCropSeedsRequiredPerHarvest && (cropInfo.isStar === parseCropId(cycleId).isStar)">
              <span class="font-semibold">Seeds per Replant:</span>&nbsp;{{ selectedCropSeedsRequiredPerHarvest.count }}
            </p>
            <p class="font-semibold badge badge-sm" v-else>
              <span class="font-semibold">Seeds per Replant:</span>&nbsp;N/A
            </p>
            <p v-if="(selectedCropSeedsRequiredPerHarvest?.count || 0) !== selectedCropTotalSeedsRequired && (cropInfo.isStar === parseCropId(cycleId).isStar)"
              class="font-semibold badge badge-sm"><span class="font-semibold">Total Seeds Used:</span>&nbsp;{{
                selectedCropTotalSeedsRequired }}</p>
          </div>
          <div>
            <p class="text-sm pb-1">Harvest days/cycle</p>
            <ul class="flex flex-wrap gap-2">
              <template v-for="harvestYield in selectedCropCycleData.phases">
                <li class="flex flex-col">
                  <p class="text-xs">Day {{ harvestYield.dayOfHarvest }}</p>
                  <ItemDisplay class="max-w-12" :imgSrc="selectedCropAsCrop?.image" :imgAlt="selectedCropAsCrop?.type"
                    :star="cropInfo.isStar"
                    :count="(harvestYield.yield[(cropInfo.isStar ? 'star' : 'base')].totalWithDeductions)" />
                </li>
              </template>
              <li class="flex flex-col md:pl-4 md:border-l-2 border-l-misc"
                v-if="harvester.settings.includeReplantCost && (cropInfo.isStar === parseCropId(cycleId).isStar)">
                <p class="text-xs">Average deduction (Day {{ selectedCropCycleData.phases.at(-1)!.dayOfHarvest }})
                </p>
                <ItemDisplay class="max-w-12" :imgSrc="selectedCropAsCrop?.image" :imgAlt="selectedCropAsCrop?.type"
                  :star="cropInfo.isStar"
                  :count="(selectedCropCycleData.phases.at(-1)!.yield[(cropInfo.isStar ? 'star' : 'base')].totalWithDeductions - selectedCropCycleData.phases.at(-1)!.yield[(cropInfo.isStar ? 'star' : 'base')].totalRaw)" />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Processing Info -->
      <div v-if="selectedCropProcessingData && selectedCropProcessingData.cycleData.length > 0"
        class="flex flex-col gap-2 p-2 border rounded-sm border-misc-dark bg-accent">
        <div>
          <div class="join  w-fit">
            <button class="join-item btn btn-sm btn-primary" @click="cropDetailsProcessTab = 'overall'"
              :class="{ 'btn-active': cropDetailsProcessTab === 'overall' }">
              Cycle Summary
            </button>
            <button class="join-item btn btn-sm btn-primary" @click="cropDetailsProcessTab = 'cycle-data'"
              :class="{ 'btn-active': cropDetailsProcessTab === 'cycle-data' }">
              Crafter Data
            </button>
          </div>
          <p v-if="canFinishBeforeNextHarvest" class="text-neutral font-semibold text-xs">
            <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
            Harvests can't process before next harvest
          </p>
        </div>
        <div v-if="cropDetailsProcessTab === 'overall'"
          class="grid grid-cols-2 flex-wrap gap-1 gap-y-2 text-sm xl:grid-cols-3 pb-4">
          <div class="flex flex-col gap-1 py-1 border border-palia-blue px-1 rounded-xs justify-between">
            <p class="text-palia-blue opacity-80 text-xs">Average Produce/Cycle:</p>
            <ItemDisplay class="max-w-12"
              :imgSrc="selectedCropAsCrop![`${selectedCropIsProcessedAs === ItemType.Preserve ? 'preserveImage' : 'seedImage'}`]"
              :imgAlt="`${selectedCropAsCrop!.type} ${selectedCropIsProcessedAs}`"
              :count="selectedCropProcessingData.averageProduce" />
          </div>
          <div class="flex flex-col gap-1 py-1 border border-palia-blue px-2 justify-between rounded-xs">
            <p class="text-palia-blue opacity-80 text-xs">Gold Generated</p>
            <div class="font-bold text-lg flex items-center gap-1">
              <img width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                format="webp">
              <p>{{
                Math.round(selectedCropProcessingData.averageGoldGenerated).toLocaleString()
              }}</p>
            </div>
          </div>
          <div class="flex flex-col gap-1 py-1 border border-palia-blue px-2 rounded-xs justify-between">
            <p class="text-palia-blue opacity-80 text-xs">Total Active Processing Minutes</p>
            <p class="font-bold text-lg"> <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{
              formatMinutesToDaysHoursMinutes(selectedCropProcessingData.totalProcessMinutes) }}</p>
          </div>
          <div class="flex flex-col gap-1 py-1 border border-palia-blue px-2 rounded-xs justify-between">
            <p class="text-palia-blue opacity-80 text-xs">Average Cycle Processing Time</p>
            <p class="font-bold text-lg"> <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{
              formatMinutesToDaysHoursMinutes(selectedCropProcessingData.averageProcessMinutes)
            }}</p>
          </div>
          <div class="flex flex-col gap-1 py-1 border border-palia-blue px-2 rounded-xs justify-between">
            <p class="text-palia-blue opacity-80 text-xs">Estimated Time to Process Everything</p>
            <p class="font-bold text-lg"> <font-awesome-icon :icon="['fas', 'stopwatch']" /> {{
              formatMinutesToDaysHoursMinutes(selectedCropProcessingData.effectiveProcessMinutes) }}</p>
          </div>
        </div>

        <!-- <div class="pl-2 border-l-2 border-palia-blue-dark"
          v-for="(phaseData, phaseIndex) in selectedCropProcessingData.cycleCrafterData"
          :key="`cycle-1-hase-${phaseIndex}`">
          <div class="">
            <p class="text-xs font-medium">
              Phase {{ phaseIndex + 1 }} ({{ phaseData.crafterData.length }} Crafters)
            </p>
            <p class="text-xs">
              <span class="font-semibold">Longest Time:</span> {{
                formatMinutesToHoursMinutes(phaseData.longestProcessMinutes) }} ({{
                formatMinutesToHoursMinutes(phaseData.longestProcessMinutesNoIdle) }} active)
            </p>
          </div>

        </div> -->
        <div v-if="cropDetailsProcessTab === 'cycle-data'">
          <div class="grid gap-1">
            <div class="flex justify-between">
              <!-- <div class="flex flex-col">
                <p class="text-sm">Cycle</p>
                <div v-if="cropDetailsProcessTab === 'cycle-data'" class="join">
                  <button class="join-item btn" @click="() => {
                    if (cropDetailCycleIndex <= 0)
                      return

                    cropDetailCycleIndex--
                  }">«</button>
                  <button class="join-item btn">Cycle {{ cropDetailCycleIndex + 1 }}</button>
                  <button class="join-item btn" @click="() => {
                    if (cropDetailCycleIndex >= (selectedCropProcessingData!.cycleData.length - 1))
                      return

                    else
                      cropDetailCycleIndex++
                  }">»</button>
                </div>
              </div> -->
              <div class="flex flex-row gap-2 items-center">
                <p class="text-sm font-bold">Harvest</p>
                <div class="join">
                  <button
                    v-for="phaseIndex in selectedCropProcessingData.cycleData[cropDetailCycleIndex].cycleCrafterData.length"
                    @click="cropDetailCyclePhase = (phaseIndex - 1)" class="join-item btn btn-soft btn-sm"
                    :class="{ 'btn-active': (phaseIndex - 1) === cropDetailCyclePhase }">{{ phaseIndex }}</button>
                </div>
              </div>
            </div>
            <div class="max-h-48 overflow-y-scroll overflow-x-auto ">
              <table class="table bg-primary table-sm table-pin-rows">
                <thead>
                  <tr class="font-light text-accent">
                    <th class="">
                      Crafter #
                    </th>
                    <th class="">
                      Crops Added
                    </th>
                    <th class="">
                      Processes
                    </th>
                    <th class="">
                      Time
                    </th>
                    <th class="">
                      +Idle / >Excess
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(crafter, crafterIndex) in selectedCropProcessingData.cycleData[cropDetailCycleIndex].cycleCrafterData[cropDetailCyclePhase].crafterData"
                    :key="`${cropDetailCycleIndex}-${cropDetailCyclePhase}-${crafterIndex}`">
                    <td class="">
                      {{ crafterIndex + 1 }}
                    </td>
                    <td class="">
                      {{ crafter.cropsInsertedCount.toLocaleString() }}
                    </td>
                    <td class="">
                      {{ crafter.processesDone.toLocaleString(undefined, { maximumFractionDigits: 1 }) }}
                    </td>
                    <td class="">
                      {{ formatMinutesToHoursMinutes(crafter.processTimeMinutes) }}
                    </td>
                    <td class="">
                      <template v-if="crafter.excessTimeMinutes > 0">
                        <span class="italic">
                          &gt;{{ formatMinutesToHoursMinutes(crafter.excessTimeMinutes) }}</span>
                      </template>
                      <template v-else="crafter.idleTimeMinutes > 0">
                        +{{ formatMinutesToHoursMinutes(crafter.idleTimeMinutes) }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- <div v-for="(cycle, cycleIndex) in selectedCropProcessingData" :key="`cycle-${cycleIndex}`"
      class="pb-2 mb-3 border-b border-misc last:border-b-0 last:mb-0">
      <p class="mb-1 text-xs font-semibold">
        Cycle {{ cycleIndex + 1 }} {{ cycleIndex >= selectedCropTotalFullCycles ? '(Partial)' : '' }}
      </p>

    </div> -->
      </div>
      <div
        v-else-if="selectedCropProcessingData === null || selectedCropProcessingData.cycleData[0].cycleCrafterData === undefined"
        class="p-2 border rounded-sm border-misc-dark bg-accent">
        <p class="text-sm italic text-misc-dark">
          No Process Data
        </p>
      </div>
    </div>
    <div v-else-if="selectedCropDetail" class="mt-2">
      <p class="italic font-bold text-warning">
        ERROR: No data available for {{ selectedCropDetail }}...
      </p>
    </div>
    <div v-else class="mt-2">
      <p class="italic text-misc-dark">
        Select a crop group above to see details.
      </p>
    </div>
  </section>
</template>