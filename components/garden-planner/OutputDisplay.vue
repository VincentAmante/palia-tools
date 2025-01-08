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
      <section class="grid grid-cols-3 gap-1 lg:grid-cols-5">
        <div class="border rounded-md bg-accent">
          <p class="w-full px-1 text-xs text-right text-misc-dark">
            Total
          </p>
          <p class="flex items-center justify-end gap-1 text-xl font-semibold text-center text-palia-blue">
            <img
              width="12" height="12" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined"
              alt="Gold" format="webp"
            >
            {{ (processor.finalGoldValue || 0).toLocaleString() }}
          </p>
        </div>
        <div class="text-right border rounded-md bg-accent">
          <p class="w-full px-1 text-xs text-right text-misc-dark">
            <span
              v-if="craftingTime.actualValue <= 0"
              class="text-xs font-normal tooltip"
              data-tip="Processing time excluded"
            >
              <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
            </span>
            Average
          </p>
          <p class="flex items-center justify-end w-full gap-1 text-xl font-semibold text-right text-palia-blue">
            <img
              width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined"
              alt="Gold" format="webp"
            >
            {{ (processor.averageGoldValue || 0).toLocaleString() }}
          </p>
          <p class="flex items-center justify-end gap-1 text-xs italic text-center text-palia-blue">
            per
            <span class="font-semibold">{{ processor.highestCraftingTime > 0 ? 'Hour' : 'Palian Day' }}</span>
          </p>
        </div>
        <div class="border rounded-md bg-accent">
          <p class="w-full px-1 text-xs text-right text-misc-dark">
            Processing Time
          </p>
          <p class="flex items-center justify-end gap-1 text-xl font-semibold text-right text-palia-blue">
            <template v-if="((craftingTime.hours + craftingTime.minutes) > 0)">
              {{ craftingTime.hours }}<span>h</span> {{ craftingTime.minutes }}<span>m</span>
            </template>
            <template v-else>
              <span class="text-warning">N/A</span>
            </template>
          </p>
        </div>

        <div class="border rounded-md bg-accent">
          <p class="w-full px-1 text-xs text-right text-misc-dark">
            Minimum <abbr title="Level">Lvl</abbr>
          </p>
          <p class="flex items-center gap-1 px-2 text-xl font-semibold text-center text-palia-blue">
            {{ harvester.settings.level }}
          </p>
        </div>
        <div class="border rounded-md bg-accent">
          <p class="w-full px-1 text-xs text-right text-misc-dark">
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
              <abbr title="Include">Incl.</abbr> Replant
            </span>
            <span v-if="harvester.settings.includeReplantCost">
              &nbsp;& Cost
            </span>
          </li>
          <li class="text-xs border border-none badge bgY -boost">
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
