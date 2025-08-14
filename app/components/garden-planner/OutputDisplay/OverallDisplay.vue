<script setup lang="ts">
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import TotalInventory from '../HarvestCalculator/TotalInventory.vue'
import ItemDisplay from '../HarvestCalculator/ItemDisplay.vue'

const harvester = useHarvester()
const processor = useProcessor()
const starBaseChance = computed(() => Math.trunc(Math.min(100, (0.25 + (harvester.settings.useStarSeeds ? 0.25 : 0) + (harvester.settings.level * 0.02)) * 100)))
const craftingTime = computed(() => formatMinutesToDaysHoursMinutesObject(processor.highestCraftingTime))
</script>
<template>
  <section class="flex flex-col gap-2 pt-1 @container">
    <section>
      <p class="text-sm font-semibold text-palia-blue-dark dark:text-accent">
        Overview
      </p>
      <div class="grid grid-cols-3 gap-1 @lg:grid-cols-5">
        <div class="p-1 border rounded-md bg-accent dark:bg-palia-blue-light border-misc-dark dark:border-palia-blue-dark">
          <p class="w-full px-1 text-xs text-right text-misc-dark dark:text-primary">
            Total
          </p>
          <p class="flex items-center justify-end gap-1 text-lg font-semibold text-center @2xl:text-xl text-palia-blue dark:text-accent">
            <img width="12" height="12" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
              format="webp">
            {{ parseInt((processor.finalGoldValue || 0).toFixed(0)).toLocaleString() }}
          </p>
        </div>
        <div class="p-1 border rounded-md bg-accent dark:bg-palia-blue-light border-misc-dark dark:border-palia-blue-dark">
          <p class="w-full px-1 text-xs text-right text-misc-dark dark:text-primary">
            <span v-if="craftingTime.actualValue <= 0" class="text-xs font-normal tooltip"
              data-tip="Processing time excluded">
              <FontAwesomeIcon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
            </span>
            Average
          </p>
          <p
            class="flex items-center justify-end w-full gap-1 text-lg font-semibold text-right @2xl:text-xl text-palia-blue dark:text-accent">
            <img width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined" alt="Gold"
              format="webp">
            <span v-if="processor.highestCraftingTime > 0 && processor.settings.goldAverageSetting === 'crafterTime'">
              &#8776;{{ (processor.averageGoldValue || 0).toLocaleString() }}
            </span>
            <span v-else>
              &#8776;{{ (Math.round((processor.finalGoldValue / harvester.totalHarvest.lastHarvestDay))
                || 0).toLocaleString() }}
            </span>
          </p>
          <p class="flex items-center justify-end gap-1 text-xs italic text-center text-palia-blue dark:text-accent">
            <span class="@sm:inline-block"
              :class="{ 'hidden': processor.settings.goldAverageSetting === 'growthTick' }">per</span>
            <span v-if="processor.settings.goldAverageSetting === 'growthTick'" class="@sm:hidden inline-block">/</span>

            <span v-if="processor.highestCraftingTime > 0 && processor.settings.goldAverageSetting === 'crafterTime'"
              class="font-bold text-growth-boost-dark dark:text-growth-boost">Hour <FontAwesomeIcon :icon="['fas', 'stopwatch']" /></span>
            <span v-else class="font-bold flex flex-nowrap whitespace-nowrap gap-1 text-harvest-boost-dark dark:text-harvest-boost">Growth Tick
              <FontAwesomeIcon class="" :icon="['fas', 'seedling']" />
            </span>

          </p>
        </div>
        <div class="p-1 border rounded-md bg-accent dark:bg-palia-blue-light border-misc-dark dark:border-palia-blue-dark">
          <p class="w-full text-xs text-right text-misc-dark dark:text-primary">
            Process Time
          </p>
          <p class="flex items-end justify-end text-lg font-semibold text-right text-palia-blue dark:text-accent @2xl:text-xl">
            <template v-if="((craftingTime.actualValue) > 0)">
              &#8776;<template v-if="craftingTime.days > 0">
                {{ parseInt(craftingTime.days.toFixed(0)).toLocaleString() }}
                <span class="pr-1" aria-label="Days">d</span>
              </template>
              {{ parseInt(craftingTime.hours.toFixed(0)).toLocaleString() }}
              <span class="pr-1" aria-label="Hours">h</span>

              {{
                parseInt(craftingTime.minutes.toFixed(0)).toLocaleString()
              }}<span class="" aria-label="Minutes">m</span>
            </template>
            <template v-else>
              <span class="text-palia-blue-dark dark:text-primary">N/A</span>
            </template>
          </p>

          <p v-if="(craftingTime.actualValue > 0)"
            class="flex items-center justify-end gap-1 text-xs italic text-center text-palia-blue dark:text-primary">
            Earth Time
          </p>
        </div>
        <div class="p-1 border rounded-md bg-accent dark:bg-palia-blue-light border-misc-dark dark:border-palia-blue-dark">
          <p class="w-full px-1 text-xs text-right text-misc-dark dark:text-primary">
            Level
          </p>
          <p class="flex items-center justify-end gap-1 text-lg font-semibold text-center @2xl:text-xl text-palia-blue dark:text-accent">
            {{ harvester.settings.level }}
          </p>
        </div>
        <div class="p-1 border rounded-md bg-accent dark:bg-palia-blue-light border-misc-dark dark:border-palia-blue-dark">
          <p class="w-full px-1 text-xs text-right text-misc-dark dark:text-primary">
            Days of Harvest
          </p>
          <p class="flex items-center justify-end gap-1 text-xl font-semibold text-center @2xl:text-xl text-palia-blue dark:text-accent">
            {{ harvester.totalHarvest.lastHarvestDay }}
          </p>
        </div>
      </div>
    </section>
    <section class="text-xs  whitespace-nowrap">
      <ul class="flex flex-wrap gap-1 text-palia-blue-dark">
        <li class="text-xs border-none badge badge-sm bg-quality-increase-dark">
          <p>
            <FontAwesomeIcon class="pr-1" :class="harvester.settings.useStarSeeds ? '' : ' opacity-50'"
              :icon="['fas', 'star']" />
            {{ harvester.settings.useStarSeeds ? 'Star Seed' : 'Normal Seed' }}
          </p>
        </li>
        <li v-if="harvester.settings.includeReplant" class="text-xs border-none badge badge-sm bg-harvest-boost-dark">
          <p>
            <span>
              <FontAwesomeIcon :icon="['fas', 'seedling']" class="pr-1" />
              <abbr title="Include">Incl.</abbr>Replant
            </span><span v-if="harvester.settings.includeReplantCost">& Cost

            </span>
          </p>
        </li>
        <li v-if="harvester.settings.useGrowthBoost" class="text-xs border border-none badge badge-sm">
          <p>
            <FontAwesomeIcon :icon="['fas', 'forward-fast']" class="pr-1" />
            Growth Boost
          </p>
        </li>
        <li class="text-xs badge badge-sm">
          <span class="font-black">{{ starBaseChance }}%</span>Star Crop Chance
        </li>
        <li class="text-xs badge badge-sm ">
          No Fertiliser Cost
        </li>
      </ul>
    </section>
    <TotalInventory />
    <section class="grid gap-1 md:grid-cols-2">
      <div class="flex flex-col w-full" v-if="processor.seedCollectorsCount > 0">
        <div class="flex items-end">
          <img src="https://pgp-cdn.b-cdn.net/seeder.webp" class="max-w-6" alt="Seed Collectors" aria-hidden="true">
          <p class="px-1 text-sm font-semibold text-palia-blue-dark dark:text-accent">
            Seed Collectors
            <span v-if="processor.seedCollectorsCount > 0">- {{ processor.seedCollectorsCount }}</span>
          </p>
        </div>
        <ul
          class="flex flex-wrap gap-1 p-2 bg-opacity-50 border rounded-md border-misc-dark bg-accent min-h-16 gap-y-2 dark:bg-palia-blue-light dark:border-palia-blue-dark">
          <ItemDisplay v-for="[name, item] in processor.seedCollectors" :key="name" :img-src="item.img.src"
            :img-alt="item.img.alt" :star="item.isStar" :count="item.count" :base-gold-value="item.baseGoldValue"
            tooltip="Seed Collectors to use" />
        </ul>
      </div>
      <div class="flex flex-col w-full" v-if="processor.preserveJarsCount > 0">
        <div class="flex items-end">
          <img src="https://pgp-cdn.b-cdn.net/preserve-jar.webp" class="max-w-6" alt="Preserve Jars" aria-hidden="true">
          <p class="px-1 text-sm font-semibold text-palia-blue-dark dark:text-accent">
            Preserve Jars
            <span v-if="processor.preserveJarsCount > 0">- {{ processor.preserveJarsCount }}</span>
          </p>
        </div>

        <ul
          class="flex flex-wrap items-start justify-start gap-1 p-2 bg-opacity-50 border rounded-md bg-accent dark:bg-palia-blue-light border-misc-dark min-h-16 dark:border-palia-blue-dark">
          <ItemDisplay v-for="[name, item] in processor.preserveJars" :key="name" :img-src="item.img.src"
            :img-alt="item.img.alt" :star="item.isStar" :count="item.count" :base-gold-value="item.baseGoldValue"
            tooltip="Preserve Jars to use" />
        </ul>
      </div>
    </section>
  </section>
</template>