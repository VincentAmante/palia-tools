<script setup lang="ts">
import NewSettings from './NewSettings.vue'
import TotalInventory from './HarvestCalculator/TotalInventory.vue'
import ItemDisplay from './HarvestCalculator/ItemDisplay.vue'
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
      <section>
        <p class="text-sm font-semibold text-palia-blue-dark">
          Overview
        </p>
        <div class="grid grid-cols-3 gap-1 xl:grid-cols-5">
          <div class="p-1 border rounded-md bg-accent border-misc-dark">
            <p class="w-full px-1 text-xs text-right text-misc-dark">
              Total
            </p>
            <p class="flex items-center justify-end gap-1 text-xl font-semibold text-center xl:text-2xl text-palia-blue">
              <img
                width="12" height="12" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined"
                alt="Gold" format="webp"
              >
              {{ (processor.finalGoldValue || 0).toLocaleString() }}
            </p>
          </div>
          <div class="p-1 border rounded-md bg-accent border-misc-dark">
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
            <p class="flex items-center justify-end w-full gap-1 text-xl font-semibold text-right xl:text-2xl text-palia-blue">
              <img
                width="16" height="16" src="/gold.webp" class="max-h-[1rem]" :srcset="undefined"
                alt="Gold" format="webp"
              >
              <span v-if="processor.highestCraftingTime > 0">
                &#8776;{{ (processor.averageGoldValue || 0).toLocaleString() }}
              </span>
              <span v-else>
                &#8776;{{ (Math.round((processor.finalGoldValue / harvester.totalHarvest.lastHarvestDay)) || 0).toLocaleString() }}
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
                {{ craftingTime.hours }}<span class="pr-1">h</span> {{ craftingTime.minutes }}<span class="">m</span>
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
            <p class="flex items-center justify-end gap-1 text-xl font-semibold text-center xl:text-2xl text-palia-blue">
              {{ harvester.settings.level }}
            </p>
          </div>
          <div class="p-1 border rounded-md bg-accent border-misc-dark">
            <p class="w-full px-1 text-xs text-right text-misc-dark">
              Days of Harvest
            </p>
            <p class="flex items-center justify-end gap-1 text-xl font-semibold text-center xl:text-2xl text-palia-blue">
              {{ harvester.totalHarvest.lastHarvestDay }}
            </p>
          </div>
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
      <section class="grid gap-1 md:grid-cols-2">
        <div class="flex flex-col w-full">
          <p class="px-1 text-sm font-semibold text-palia-blue-dark">
            Seed Collectors
            <span v-if="processor.seedCollectorsCount > 0">- {{ processor.seedCollectorsCount }}</span>
          </p>
          <ul class="flex flex-wrap gap-1 p-2 bg-opacity-50 border rounded-md border-misc-dark bg-accent min-h-16 gap-y-2">
            <ItemDisplay
              v-for="[name, item] in processor.seedCollectors"
              :key="name"
              :img-src="item.img.src"
              :img-alt="item.img.alt"
              :star="item.isStar"
              :count="item.count"
              :base-gold-value="item.baseGoldValue"
              tooltip="Seed Collectors to use"
            />
          </ul>
        </div>
        <div class="flex flex-col w-full">
          <p class="px-1 text-sm font-semibold text-palia-blue-dark">
            Preserve Jars
            <span v-if="processor.preserveJarsCount > 0">- {{ processor.preserveJarsCount }}</span>
          </p>
          <ul class="flex flex-wrap gap-1 p-2 bg-opacity-50 border rounded-md bg-accent border-misc-dark min-h-16 gap-y-2">
            <ItemDisplay
              v-for="[name, item] in processor.preserveJars"
              :key="name"
              :img-src="item.img.src"
              :img-alt="item.img.alt"
              :star="item.isStar"
              :count="item.count"
              :base-gold-value="item.baseGoldValue"
              tooltip="Preserve Jars to use"
            />
          </ul>
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
