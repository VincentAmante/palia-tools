<script setup lang="ts">
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import TotalInventory from './HarvestCalculator/TotalInventory.vue'
import ItemDisplay from './HarvestCalculator/ItemDisplay.vue'
import NewSettings from './NewSettings.vue'
import LazyHCInfo from './HarvestCalculator/HCInfo.vue'
import useHarvester from '~/stores/useHarvester'
import useProcessor from '~/stores/useProcessor'
import type { ICropNameWithGrowthDiff } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import type { CropType } from '~/assets/scripts/garden-planner/imports'
import { getCropFromType } from '~/assets/scripts/garden-planner/imports'

import { formatMinutesToHoursMinutes } from '~/utils/formatters' // Assuming a formatter utility exists or needs creation

const harvester = useHarvester()
const processor = useProcessor()

const starBaseChance = ref(0.25 + (harvester.settings.useStarSeeds ? 0.25 : 0) + (harvester.settings.level * 0.02))

const activeTab = ref('display')
function setTab(tab: string) {
  activeTab.value = tab
}

const craftingTime = computed(() => {
  const timeInMinutes = processor.highestCraftingTime

  const hours = Math.floor(timeInMinutes / 60)
  const minutes = timeInMinutes % 60

  return {
    actualValue: timeInMinutes,
    hours,
    minutes,
  }
})

// --- Crop Details Tab Logic ---
const selectedCropDetail = ref<ICropNameWithGrowthDiff | null>(null)

// Get unique crop types present in the harvest, maintaining the growth diff identifier
const presentCrops = computed(() => {
  const cropsMap = new Map<ICropNameWithGrowthDiff, { count: number; cropType: CropType; isStar: boolean; hasGrowthBoost: boolean }>()
  if (!harvester.totalHarvest?.crops)
    return cropsMap

  for (const [cropId, data] of harvester.totalHarvest.crops) {
    if (data.totalRaw > 0) { // Only show crops that were actually harvested
      const parts = cropId.split('-')
      const cropType = parts[0] as CropType
      const isStar = parts.includes('Star')
      const hasGrowthBoost = parts.includes('Growth')
      const existing = cropsMap.get(cropId) || { count: 0, cropType, isStar, hasGrowthBoost }
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
  const parts = cropId.split('-')
  const cropType = parts[0] as CropType
  return getCropFromType(cropType)
}

// Computed property for selected crop's cycle data
const selectedCropCycleData = computed(() => {
  if (!selectedCropDetail.value || !harvester.totalHarvest?.cycleData)
    return null
  return harvester.totalHarvest.cycleData.get(selectedCropDetail.value)
})

// Computed property for selected crop's processing data
const selectedCropProcessingData = computed(() => {
  if (!selectedCropDetail.value || !processor.output?.detailedProcessingInfo)
    return null


  const detailedProcessingInfoOutput = processor.output.detailedProcessingInfo.get(selectedCropDetail.value)

  if (detailedProcessingInfoOutput && detailedProcessingInfoOutput.length > 0){

    console.log(detailedProcessingInfoOutput[0])
    return detailedProcessingInfoOutput[0] 
  }

    
  else return null
})

// Computed property for seeds required per replant event
const selectedCropSeedsRequiredPerEvent = computed(() => {
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
  <section class="p-2 ">
    <section class="flex justify-end gap-2 pb-2 border-b border-b-misc">
      <!-- <p>
        Tab Select
      </p> -->
      <button id="approximator-display-tab" aria-label="Display Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc" :class="activeTab === 'display' ? 'btn-active' : ''"
        @click="setTab('display')">
        <FontAwesomeIcon :icon="['fas', 'table-list']" />
      </button>

      <button id="approximator-crop-details-tab" aria-label="Crop Details Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc"
        :class="activeTab === 'crop-details' ? 'btn-active' : ''" @click="setTab('crop-details')">
        <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" />
      </button>
      <button id="approximator-options-tab" aria-label="Options Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc" :class="activeTab === 'options' ? 'btn-active' : ''"
        @click="setTab('options')">
        <FontAwesomeIcon :icon="['fas', 'sliders']" />
      </button>
      <button id="approximator-info-tab" aria-label="Info Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc" :class="activeTab === 'info' ? 'btn-active' : ''"
        @click="setTab('info')">
        <FontAwesomeIcon :icon="['fas', 'info']" />
      </button>
    </section>
    <section v-show="activeTab === 'display'" id="display-tab" class="flex flex-col gap-2 pt-1">
      <section>
        <p class="text-sm font-semibold text-palia-blue-dark">
          Overview
        </p>
        <div class="grid grid-cols-3 gap-1 xl:grid-cols-5">
          <div class="p-1 border rounded-md bg-accent border-misc-dark">
            <p class="w-full px-1 text-xs text-right text-misc-dark">
              Total
            </p>
            <p
              class="flex items-center justify-end gap-1 text-xl font-semibold text-center xl:text-2xl text-palia-blue">
              <img width="12" height="12" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                format="webp">
              {{ (processor.finalGoldValue || 0).toLocaleString() }}
            </p>
          </div>
          <div class="p-1 border rounded-md bg-accent border-misc-dark">
            <p class="w-full px-1 text-xs text-right text-misc-dark">
              <span v-if="craftingTime.actualValue <= 0" class="text-xs font-normal tooltip"
                data-tip="Processing time excluded">
                <FontAwesomeIcon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
              </span>
              Average
            </p>
            <p
              class="flex items-center justify-end w-full gap-1 text-xl font-semibold text-right xl:text-2xl text-palia-blue">
              <img width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
                format="webp">
              <span v-if="processor.highestCraftingTime > 0">
                &#8776;{{ (processor.averageGoldValue || 0).toLocaleString() }}
              </span>
              <span v-else>
                &#8776;{{ (Math.round((processor.finalGoldValue / harvester.totalHarvest.lastHarvestDay))
                  || 0).toLocaleString() }}
              </span>
            </p>
            <p class="flex items-center justify-end gap-1 text-xs italic text-center text-palia-blue">
              per
              <span class="font-semibold">{{ processor.highestCraftingTime > 0 ? 'Hour' : 'Growth Tick' }}</span>
            </p>
          </div>
          <div class="p-1 border rounded-md bg-accent border-misc-dark">
            <p class="w-full text-xs text-right text-misc-dark">
              Process Time
            </p>
            <p class="flex items-end justify-end text-xl font-semibold text-right text-palia-blue xl:text-2xl">
              <template v-if="((craftingTime.hours + craftingTime.minutes) > 0)">
                {{ craftingTime.hours.toFixed(0) }}<span class="pr-1">h</span> {{ craftingTime.minutes.toFixed(0) }}<span class="">m</span>
              </template>
              <template v-else>
                <span class="text-warning">N/A</span>
              </template>
            </p>
          </div>
          <div class="p-1 border rounded-md bg-accent border-misc-dark">
            <p class="w-full px-1 text-xs text-right text-misc-dark">
              Level
            </p>
            <p
              class="flex items-center justify-end gap-1 text-xl font-semibold text-center xl:text-2xl text-palia-blue">
              {{ harvester.settings.level }}
            </p>
          </div>
          <div class="p-1 border rounded-md bg-accent border-misc-dark">
            <p class="w-full px-1 text-xs text-right text-misc-dark">
              Days of Harvest
            </p>
            <p
              class="flex items-center justify-end gap-1 text-xl font-semibold text-center xl:text-2xl text-palia-blue">
              {{ harvester.totalHarvest.lastHarvestDay }}
            </p>
          </div>
        </div>
      </section>
      <section class="text-xs">
        <ul class="flex flex-wrap gap-1 text-palia-blue-dark">
          <li class="text-xs border-none badge bg-quality-increase-dark">
            <FontAwesomeIcon class="mr-1" :class="harvester.settings.useStarSeeds ? '' : ' opacity-50'"
              :icon="['fas', 'star']" />
            {{ harvester.settings.useStarSeeds ? 'Star Seed' : 'Normal Seed' }}
          </li>
          <li v-if="harvester.settings.includeReplant" class="text-xs border-none badge bg-harvest-boost-dark">
            <span>
              <FontAwesomeIcon :icon="['fas', 'seedling']" class="mr-1" />
              <abbr title="Include">Incl.</abbr> Replant
            </span>
            <span v-if="harvester.settings.includeReplantCost">
              &nbsp;& Cost
            </span>
          </li>
          <li class="text-xs border border-none badge bgY -boost">
            <p>
              <FontAwesomeIcon :icon="['fas', 'forward-fast']" class="mr-1" />
              Growth Boost
            </p>
          </li>
          <li class="text-xs badge">
            {{ Math.trunc(Math.min(100, starBaseChance * 100)) }}% Star Crop Chance
          </li>
          <li class="text-xs badge">
            No Fertiliser Cost
          </li>
        </ul>
      </section>
      <TotalInventory />
      <section class="grid gap-1 md:grid-cols-2">
        <div class="flex flex-col w-full">
          <p class="px-1 text-sm font-semibold text-palia-blue-dark">
            Seed Collectors
            <span v-if="processor.seedCollectorsCount > 0">- {{ processor.seedCollectorsCount }}</span>
          </p>
          <ul
            class="flex flex-wrap gap-1 p-2 bg-opacity-50 border rounded-md border-misc-dark bg-accent min-h-16 gap-y-2">
            <ItemDisplay v-for="[name, item] in processor.seedCollectors" :key="name" :img-src="item.img.src"
              :img-alt="item.img.alt" :star="item.isStar" :count="item.count" :base-gold-value="item.baseGoldValue"
              tooltip="Seed Collectors to use" />
          </ul>
        </div>
        <div class="flex flex-col w-full">
          <p class="px-1 text-sm font-semibold text-palia-blue-dark">
            Preserve Jars
            <span v-if="processor.preserveJarsCount > 0">- {{ processor.preserveJarsCount }}</span>
          </p>
          <ul
            class="flex flex-wrap gap-1 p-2 bg-opacity-50 border rounded-md bg-accent border-misc-dark min-h-16 gap-y-2">
            <ItemDisplay v-for="[name, item] in processor.preserveJars" :key="name" :img-src="item.img.src"
              :img-alt="item.img.alt" :star="item.isStar" :count="item.count" :base-gold-value="item.baseGoldValue"
              tooltip="Preserve Jars to use" />
          </ul>
        </div>
      </section>
    </section>
    <section v-show="activeTab === 'options'" id="settings-tab">
      <p class="sr-only">
        Settings
      </p>
      <NewSettings />
    </section>
    <section v-show="activeTab === 'crop-details'" id="crop-details-tab"
      class="flex flex-col gap-2 pt-1 text-palia-blue-dark">
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
            <img :src="getCropInfoForDetail(cropId)?.image" :alt="data.cropType" class="object-contain w-6 h-6"
              width="24" height="24" :srcset="undefined" format="webp">
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
          <div class="grid grid-cols-2 gap-1 text-xs md:grid-cols-4">
            <div><span class="font-semibold">Cycle Duration:</span> {{ selectedCropCycleDuration }} Days</div>
            <div><span class="font-semibold">Harvests per Cycle:</span> {{ selectedCropCycleData.phases.length }}</div>
            <div><span class="font-semibold">Total Full Cycles:</span> {{ selectedCropTotalFullCycles }}</div>
            <div><span class="font-semibold">Total Harvests:</span> {{ selectedCropCycleData.totalHarvestsCount }}</div>
          </div>
        </div>

        <!-- Seed Info -->
        <div v-if="harvester.settings.includeReplantCost" class="p-2 border rounded border-misc-dark bg-accent">
          <p class="mb-1 text-sm font-medium text-palia-blue-dark">
            Replanting Info
          </p>
          <div class="grid grid-cols-2 gap-1 text-xs md:grid-cols-4">
            <div v-if="selectedCropSeedsRequiredPerEvent">
              <span class="font-semibold">Seeds per Replant:</span> {{ selectedCropSeedsRequiredPerEvent.count }}
            </div>
            <div v-else>
              <span class="font-semibold">Seeds per Replant:</span> N/A (Not replanted)
            </div>
            <div><span class="font-semibold">Total Seeds Used:</span> {{ selectedCropTotalSeedsRequired }}</div>
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
    <section v-show="activeTab === 'info'" id="info-tab">
      <p>
        Info
      </p>
      <LazyHCInfo class="max-h-[26.5rem]" />
    </section>
  </section>
</template>
