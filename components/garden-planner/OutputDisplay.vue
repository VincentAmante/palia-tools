<script setup lang="ts">
import NewSettings from './NewSettings.vue'
import TotalInventory from './HarvestCalculator/TotalInventory.vue'
import useHarvester from '~/stores/useHarvester'
import useProcessor from '~/stores/useProcessor'

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
</script>

<template>
  <section class="p-2 ">
    <section class="flex justify-end gap-2 pb-2 border-b border-b-misc">
      <!-- <p>
        Tab Select
      </p> -->
      <button
        id="approximator-display-tab"
        aria-label="Display Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc"
        :class="activeTab === 'display' ? 'btn-active' : ''"
        @click="setTab('display')"
      >
        <font-awesome-icon :icon="['fas', 'table-list']" />
      </button>
      <button
        id="approximator-options-tab"
        aria-label="Options Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc"
        :class="activeTab === 'options' ? 'btn-active' : ''"
        @click="setTab('options')"
      >
        <font-awesome-icon :icon="['fas', 'sliders']" />
      </button>
      <button
        id="approximator-info-tab" aria-label="Info Tab"
        class="text-lg border-none btn-circle btn-sm btn btn-misc"
        :class="activeTab === 'info' ? 'btn-active' : ''"
        @click="setTab('info')"
      >
        <font-awesome-icon :icon="['fas', 'info']" />
      </button>
    </section>
    <section
      v-show="activeTab === 'display'"
      id="display-tab"
      class="flex flex-col gap-2 pt-1"
    >
      <p class="sr-only">
        Summary Display
      </p>
      <section class="flex flex-col flex-wrap gap-2 sm:flex-row">
        <div class="flex flex-col justify-start p-2 pr-10 border rounded-md bg-accent">
          <p class="px-1 text-xs font-semibold opacity-60 text-palia-blue-dark">
            Total
          </p>
          <p class="flex items-center gap-1 text-3xl font-semibold text-center text-palia-blue">
            <img
              width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined"
              alt="Gold" format="webp"
            >
            {{ (processor.finalGoldValue || 0).toLocaleString() }}
          </p>
        </div>
        <div class="flex flex-col justify-start p-2 pr-10 border rounded-md bg-accent">
          <p class="px-1 text-xs font-semibold opacity-70 text-palia-blue-dark">
            Average
            <span
              v-if="craftingTime.actualValue <= 0"
              class="text-xs font-normal"
            >
              (no processing time)
            </span>
          </p>
          <p class="flex items-center gap-1 text-3xl font-semibold text-center text-palia-blue">
            <img
              width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined"
              alt="Gold" format="webp"
            >
            {{ (processor.averageGoldValue || 0).toLocaleString() }}
            <span class="text-xs">/ {{ processor.highestCraftingTime > 0 ? 'Hour' : 'Palian Day' }}</span>
          </p>
        </div>
      </section>
      <section class="flex gap-2">
        <div class="flex flex-col justify-start p-1 pr-8 border rounded-md bg-accent">
          <p class="px-1 text-xs opacity-60 text-palia-blue-dark">
            Minimum Lvl
          </p>
          <p class="flex items-center gap-1 px-2 text-xl font-semibold text-center text-palia-blue">
            {{ harvester.settings.level }}
          </p>
        </div>
        <div class="flex flex-col justify-start p-1 pr-8 border rounded-md bg-accent">
          <p class="px-1 text-xs opacity-60 text-palia-blue-dark">
            Processing Time
          </p>
          <p class="flex items-center gap-1 px-2 text-xl font-semibold text-center text-palia-blue">
            {{ craftingTime.hours }}<span>hrs</span> {{ craftingTime.minutes }}<span>min</span>
          </p>
        </div>
        <div class="flex flex-col justify-start p-1 pr-8 border rounded-md bg-accent">
          <p class="px-1 text-xs opacity-60 text-palia-blue-dark">
            Days of Harvest
          </p>
          <p class="flex items-center gap-1 px-2 text-xl font-semibold text-center text-palia-blue">
            {{ harvester.totalHarvest.lastHarvestDay }}
          </p>
        </div>
      </section>
      <section class="text-xs">
        <ul class="flex flex-wrap gap-1 text-palia-blue-dark">
          <li class="text-xs border-none badge bg-quality-increase-dark">
            <font-awesome-icon
              class="mr-1"
              :class="harvester.settings.useStarSeeds ? '' : ' opacity-50'"
              :icon="['fas', 'star']"
            />
            {{ harvester.settings.useStarSeeds ? 'Star Seed' : 'Normal Seed' }}
          </li>
          <li
            v-if="harvester.settings.includeReplant"
            class="text-xs border-none badge bg-harvest-boost-dark"
          >
            <span>
              <font-awesome-icon :icon="['fas', 'seedling']" class="mr-1" />
              Include Replant
            </span>
            <span v-if="harvester.settings.includeReplantCost">
              &nbsp;& Cost
            </span>
          </li>
          <li class="text-xs border border-none badge bg-growth-boost">
            <p>
              <font-awesome-icon :icon="['fas', 'forward-fast']" class="mr-1" />
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
      <section class="flex justify-between gap-2">
        <div class="flex flex-col w-full">
          <p class="px-1 font-semibold text-palia-blue-dark">
            Seed Collectors
          </p>
          <p class="flex items-center justify-center gap-2 p-1 text-lg font-semibold text-center border rounded-md border-misc bg-accent text-palia-blue">
            {{ processor.seedCollectorsCount }}
          </p>
        </div>
        <div class="flex flex-col w-full">
          <p class="px-1 font-semibold text-palia-blue-dark">
            Preserve Jars
          </p>
          <p class="flex items-center justify-center gap-2 p-1 text-lg font-semibold text-center border rounded-md border-misc bg-accent text-palia-blue">
            {{ processor.preserveJarsCount }}
          </p>
        </div>
      </section>
    </section>
    <section
      v-show="activeTab === 'options'"
      id="settings-tab"
    >
      <p class="sr-only">
        Settings
      </p>
      <NewSettings />
    </section>
  </section>
</template>
