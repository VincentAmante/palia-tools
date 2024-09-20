<script setup lang="ts">
import NewSettings from './NewSettings.vue'
import TotalInventory from './HarvestCalculator/TotalInventory.vue'
import useHarvester from '~/stores/useHarvester'

const harvester = useHarvester()

const activeTab = ref('display')
function setTab(tab: string) {
  activeTab.value = tab
}
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
      v-if="activeTab === 'display'"
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
            10,000
          </p>
          <p class="text-xs text-palia-blue-dark">
            <!-- <span class="opacity-50">After </span> -->
            <span class="font-bold opacity-80">{{ harvester.totalHarvest.lastHarvestDay }}</span>
            <span class="opacity-60"> Days of Harvest</span>
          </p>
        </div>
        <div class="flex flex-col justify-start p-2 pr-10 border rounded-md bg-accent">
          <p class="px-1 text-xs font-semibold opacity-70 text-palia-blue-dark">
            Average
            <span class="text-xs font-normal">
              (no processing time)
            </span>
          </p>
          <p class="flex items-center gap-1 text-3xl font-semibold text-center text-palia-blue">
            <img
              width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined"
              alt="Gold" format="webp"
            >
            1,000
            <span class="text-xs">/ Palian Day</span>
          </p>
        </div>
        <div class="flex flex-col justify-start p-2 pr-10 border rounded-md bg-accent">
          <p class="px-1 text-xs font-semibold opacity-60 text-palia-blue-dark">
            Minimum Level
          </p>
          <p class="flex items-center gap-1 text-3xl font-semibold text-center text-palia-blue">
            6
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
            12hrs 55min
          </p>
        </div>
      </section>
      <section class="text-xs">
        <ul class="flex flex-wrap gap-1 text-palia-blue-dark">
          <li class="">
            Star Seeds
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
            <img
              width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined"
              alt="Gold" format="webp"
            >
            10,000
          </p>
        </div>
        <div class="flex flex-col w-full">
          <p class="px-1 font-semibold text-palia-blue-dark">
            Preserve Jars
          </p>
          <p class="flex items-center justify-center gap-2 p-1 text-lg font-semibold text-center border rounded-md border-misc bg-accent text-palia-blue">
            <img
              width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined"
              alt="Gold" format="webp"
            >
            10,000
          </p>
        </div>
      </section>
    </section>
    <section
      v-else-if="activeTab === 'options'"
      id="settings-tab"
    >
      <p class="sr-only">
        Settings
      </p>
      <NewSettings />
    </section>
  </section>
</template>
