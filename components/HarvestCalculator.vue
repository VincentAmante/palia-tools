<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import LazyHCInfo from './garden-planner/HarvestCalculator/HCInfo.vue'
import HCTags from './garden-planner/HarvestCalculator/HCTags.vue'
import LazyHCTotal from './garden-planner/HarvestCalculator/HCTotal.vue'
import LazyHCDay from './garden-planner/HarvestCalculator/HCDay.vue'
import type { ICalculateValueResult, ISimulateYieldResult } from '@/assets/scripts/garden-planner/imports'
import { CropType, Garden, crops } from '@/assets/scripts/garden-planner/imports'
import type { CalculateValueOptions } from '@/assets/scripts/garden-planner/classes/garden'

const props = defineProps({
  layout: {
    type: Garden,
    required: true,
  },
})

// TODO: Convert these to one object
const postLevel25 = ref(false)
const allStarSeeds = ref(true)
const includeReplant = ref(true)
const includeReplantCost = ref(true)
const baseChanceStarSeed = ref(66)
const baseChanceNormalSeed = ref(0)
const days = ref<number>(0)

const harvestData = computed<ISimulateYieldResult>(() => {
  let daysToCalculate = days.value
  if (daysToCalculate <= 0)
    daysToCalculate = 0

  return props.layout.simulateYield({
    postLevel25: postLevel25.value,
    allStarSeeds: allStarSeeds.value,
    includeReplant: includeReplant.value,
    days: (days.value),
    starChanceOverride: (baseChanceStarSeed.value / 100),
    baseChanceOverride: (baseChanceNormalSeed.value / 100),
    includeReplantCost: (includeReplantCost.value && includeReplant.value),
  })
})

type ProduceOptions = 'crop' | 'seed' | 'preserve'

const cropOptions = ref({
  [CropType.Tomato]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.Potato]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.Wheat]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.Rice]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.Cotton]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.Onion]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.Carrot]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.Blueberry]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.Apple]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.Corn]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.SpicyPepper]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
  [CropType.None]: {
    starType: 'crop' as ProduceOptions,
    baseType: 'crop' as ProduceOptions,
  },
})

const processedYields = computed<ICalculateValueResult>(() => {
  const goldValueCalculations = props.layout.calculateValue(cropOptions.value as CalculateValueOptions,
    harvestData.value,
  )
  return goldValueCalculations
})

const activeTab = ref('display')
function setTab(tab: string) {
  activeTab.value = tab
}

const activeDisplayTab = ref('overview')
function setDisplayTab(tab: 'overview' | 'day') {
  activeDisplayTab.value = tab
}

function setCropOption(cropType: CropType, type: 'star' | 'base', option: ProduceOptions) {
  if (type === 'star')
    cropOptions.value[cropType].starType = option

  else
    cropOptions.value[cropType].baseType = option
}

watchEffect(() => {
  if (
    baseChanceStarSeed.value < 0)
    baseChanceStarSeed.value = 0

  else if (baseChanceStarSeed.value > 100)
    baseChanceStarSeed.value = 100
})
</script>

<template>
  <div class="collapse collapse-arrow rounded-none md:rounded-lg w-full h-fit max-h-[30rem] md:mx-auto md:py-4 lg:py-0 lg:mx-0 md:px-2 ">
    <div class="bg-primary md:rounded-lg ">
      <div class="flex flex-col gap-1">
        <div class="w-full md:bg-misc sm:rounded-lg sm:rounded-b-none p-2 sm:px-6 flex flex-col md:flex-row justify-between items-center text-misc md:text-accent">
          <div class="divider my-1 before:bg-accent after:bg-accent" />
          <h2 class="text-2xl md:text-2xl py-4 flex items-center flex-wrap gap-1">
            Harvest Approximations <span
              class="text-xs font-normal"
            >(WIP)</span>
          </h2>
          <div class="tabs w-fit flex flex-nowrap bg-misc rounded-md px-4 md:px-0">
            <button
              id="approximator-display-tab"
              aria-label="Display Tab"
              class="tab px-1 text-xl md:text-2xl" :class="activeTab === 'display' ? 'tab-active' : ''"
              @click="setTab('display')"
            >
              <font-awesome-icon :icon="['fas', 'table']" />
            </button>
            <button
              id="approximator-options-tab"
              aria-label="Options Tab"
              class="tab px-1 text-xl md:text-2xl" :class="activeTab === 'options' ? 'tab-active' : ''"
              @click="setTab('options')"
            >
              <font-awesome-icon :icon="['fas', 'sliders']" />
            </button>
            <button
              id="approximator-info-tab"
              aria-label="Info Tab"
              class="tab px-1 text-xl md:text-2xl" :class="activeTab === 'info' ? 'tab-active' : ''"
              @click="setTab('info')"
            >
              <font-awesome-icon :icon="['fas', 'info-circle']" />
            </button>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2 px-4 py-2">
        <div class="bg-accent text-misc rounded-md flex justify-center gap-4 py-2">
          <div class="font-bold flex gap-1 items-center text-xl">
            {{ Math.max(processedYields.totalResult.day, days) }} Days:
            <div class="flex gap-1 items-center">
              <nuxt-img
                width="1rem"
                height="1rem"
                src="/gold.webp" class="max-h-[1rem]"
                alt="Gold" format="webp"
              />{{
                processedYields.totalResult.totalGold.toLocaleString() }}
            </div>
          </div>
          <div class="divider divider-horizontal after:bg-misc before:bg-misc" />
          <p v-if="processedYields.totalResult.totalGold !== 0" class="flex gap-1 items-center text-xl">
            Average:
            <span class="flex gap-1 items-center"><nuxt-img
              src="/gold.webp"
              class="max-h-[1rem]"
              format="webp"
              alt="Gold"
              width="1rem"
              height="1rem"
            />{{
              (Math.round(processedYields.totalResult.totalGold
                / processedYields.totalResult.day)).toLocaleString() }}</span>
            / day
          </p>
        </div>
        <HCTags
          :post-level25="postLevel25"
          :all-star-seeds="allStarSeeds"
          :include-replant="includeReplant"
          :include-replant-cost="includeReplantCost"
          :base-chance-star-seed="baseChanceStarSeed"
          :base-chance-normal-seed="baseChanceNormalSeed"
        />
      </div>
      <div v-show="activeTab === 'display'" class="flex flex-col px-4 max-h-[286px]">
        <div class="tabs gap-2">
          <div
            class="tab btn btn-sm rounded-md"
            :class="activeDisplayTab === 'overview' ? 'tab-active btn-accent' : 'btn-ghost text-misc text-opacity-50'"
            @click="setDisplayTab('overview')"
          >
            Overall
          </div>
          <div
            class="tab btn btn-sm rounded-md"
            :class="activeDisplayTab === 'day' ? 'tab-active btn-accent' : 'btn-ghost text-misc text-opacity-50'"
            @click="setDisplayTab('day')"
          >
            Day-by-day
          </div>
        </div>
        <div class="py-2">
          <div
            v-if="activeDisplayTab === 'overview'"
            class="flex flex-col gap-2"
          >
            <LazyHCTotal
              :processed-yields="processedYields as ICalculateValueResult"
              :harvest-data="harvestData as ISimulateYieldResult"
              :crop-options="cropOptions as Record<CropType, { starType: ProduceOptions; baseType: ProduceOptions }>"
            />
          </div>
          <div
            v-if="activeDisplayTab === 'day'"
            class="isolate overflow-hidden overflow-y-scroll max-h-64 pb-4"
          >
            <div class="py-2">
              <div class="overflow-x-hidden">
                <LazyHCDay
                  v-if="harvestData"
                  :processed-yields="processedYields as ICalculateValueResult"
                  :harvest-data="harvestData as ISimulateYieldResult"
                  :crop-options="cropOptions as Record<CropType, { starType: ProduceOptions; baseType: ProduceOptions }>"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'options'" class="flex flex-col gap-2 py-4 max-h-72 overflow-y-scroll">
        <div class="flex flex-col gap-2">
          <h5 class="font-semibold">
            Main Options
          </h5>
          <div class="flex flex-col w-full bg-base-200 p-2 rounded-md">
            <label class="flex gap-2 items-center">
              <p>Days</p>
              <div class="join">
                <input v-model="days" class="join-item input input-sm w-fit bg-base-100" type="number">
                <button
                  class="join-item btn btn-sm btn-primary transition-all"
                  :class="days === 0 ? 'btn-active' : ''" @click="days = 0"
                >
                  Auto
                </button>
              </div>
            </label>
            <p class="text-xs maw-w-xs">
              Manual override for how many days to calculate
            </p>
            <p class="text-xs max-w-xs">
              Set to auto to calculate till the longest growing plant finishes
            </p>
          </div>

          <div class="flex flex-col  w-full bg-base-200 p-2 rounded-md gap-1">
            <label class="flex gap-2 items-center">
              <p>Post Level 25</p>
              <input v-model="postLevel25" class="toggle" type="checkbox">
            </label>
            <p class="text-xs max-w-xs">
              After level 25 Gardening, star seeds alone gives you the full quality
              bonus.
            </p>
          </div>
          <div class="flex flex-col  w-full bg-base-200 p-2 rounded-md gap-1">
            <label class="flex gap-2 items-center">
              <p>All Star Seeds</p>
              <input v-model="allStarSeeds" class="toggle" type="checkbox">
            </label>
            <p class="text-xs max-w-xs">
              The entire layout will use star seeds
            </p>
          </div>

          <div class="flex flex-col  w-full bg-base-200 p-2 rounded-md gap-1">
            <label class="flex gap-2 items-center justify-start max-w-xl">
              <p>Star Base Chance</p>
              <div class="join">
                <button
                  class="join-item btn btn-sm btn-primary transition-all"
                  :class="baseChanceStarSeed === 66 ? 'btn-active' : ''"
                  @click="baseChanceStarSeed = 66"
                >
                  66%
                </button>
                <button
                  class="join-item btn btn-sm btn-primary transition-all"
                  :class="baseChanceStarSeed === 50 ? 'btn-active' : ''"
                  @click="baseChanceStarSeed = 50"
                >
                  50%
                </button>
                <button
                  class="join-item btn btn-sm btn-primary transition-all"
                  :class="baseChanceStarSeed === 33 ? 'btn-active' : ''"
                  @click="baseChanceStarSeed = 33"
                >
                  33%
                </button>
              </div>
            </label>

            <p class="text-xs max-w-sm">
              Until base chance is confirmed, this setting will adjust the likelihood of crop quality when
              using
              star seeds
            </p>
          </div>

          <div class="flex flex-col  w-full bg-base-200 p-2 rounded-md gap-1">
            <label class="flex gap-2 items-center justify-start max-w-xl">
              <p>Normal Base Chance</p>
              <div class="join">
                <button
                  class="join-item btn btn-sm btn-primary transition-all"
                  :class="baseChanceNormalSeed === 0 ? 'btn-active' : ''"
                  @click="baseChanceNormalSeed = 0"
                >
                  0%
                </button>
                <button
                  class="join-item btn btn-sm btn-primary transition-all"
                  :class="baseChanceNormalSeed === 33 ? 'btn-active' : ''"
                  @click="baseChanceNormalSeed = 33"
                >
                  33%
                </button>
              </div>
            </label>
            <p class="text-xs max-w-sm">
              Same as above, but for normal seeds
            </p>
          </div>

          <div class="flex flex-col  w-full bg-base-200 p-2 rounded-md gap-1">
            <label class="flex gap-2 items-center">
              <p>Include Replant</p>
              <input v-model="includeReplant" class="toggle" type="checkbox">
            </label>
            <p class="text-xs max-w-xs">
              Assumes that everytime a crop is harvested and there's leftover days,
              the player will re-plant
            </p>
            <p class="text-xs max-w-xs font-bold">
              If toggled off, bonuses will still be calculated but the
              harvest days will be inaccurate
            </p>
          </div>
          <div class="flex flex-col  w-full bg-base-200 p-2 rounded-md gap-1">
            <label class="flex gap-2 items-center">
              <p>Include Replant Cost</p>
              <input
                v-model="includeReplantCost" class="toggle" type="checkbox"
                :disabled="!includeReplant"
              >
            </label>
            <p class="text-xs max-w-xs">
              Accounts for the cost of re-planting
            </p>
          </div>
          <div class="flex flex-col  w-full bg-base-200 p-2 rounded-md gap-1">
            <label class="flex gap-2 items-center">
              <p class="opacity-50">Include Fertiliser Costs</p>
              <input class="toggle" type="checkbox" disabled>
            </label>
            <p class="text-xs max-w-xs opacity-70">
              <font-awesome-icon class="text-warning text-sm" :icon="['fas', 'triangle-exclamation']" />
              Not yet supported
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-1 p-2">
          <div>
            <h5 class="font-bold text-lg">
              Crop Options
            </h5>
            <div class="flex flex-col">
              <p class="text-sm">
                Choose as to what form you wish to sell the crop
              </p>
              <p class="text-xs">
                <font-awesome-icon class="text-warning text-sm" :icon="['fas', 'triangle-exclamation']" />
                Conversion time is not yet accounted for with seeds and preserves
              </p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row md:flex-wrap gap-3">
            <template v-for="(crop, type) in crops" :key="type">
              <div
                v-if="crops[type]"
                class="flex md:flex-col gap-2 md:gap-1 items-center justify-start py-2 md:aspect-square p-1 rounded-lg bg-base-100"
              >
                <div class="flex flex-col items-center justify-center pl-1">
                  <nuxt-img format="webp" class="max-w-[3rem] object-contain p-1 py-1 aspect-square" :src="crop?.image" />
                  <p class="text-xs capitalize font-bold">
                    {{ crop?.type }}
                  </p>
                </div>
                <div class="flex flex-col gap-1 px-2 pb-2">
                  <div class="flex flex-col text-sm items-center font-bold">
                    <p class="text-xs">
                      Star
                    </p>
                    <div class="join">
                      <button
                        class="join-item btn btn-xs btn-primary"
                        :class="{ 'btn-active': cropOptions[type].starType === 'crop' }"
                        @click="setCropOption(type, 'star', 'crop')"
                      >
                        Crop
                      </button>
                      <button
                        class="join-item btn btn-xs btn-primary"
                        :class="{ 'btn-active': cropOptions[type].starType === 'seed' }"
                        @click="setCropOption(type, 'star', 'seed')"
                      >
                        Seed
                      </button>
                      <button
                        v-if="crop?.goldValues?.hasPreserve"
                        class="join-item btn btn-xs btn-primary"
                        :class="{ 'btn-active': cropOptions[type].starType === 'preserve' }"
                        @click="setCropOption(type, 'star', 'preserve')"
                      >
                        Jar
                      </button>
                    </div>
                  </div>
                  <div class="flex flex-col items-center font-semibold">
                    <p class="text-xs">
                      Normal
                    </p>
                    <div class="join">
                      <button
                        class="join-item btn btn-xs btn-primary"
                        :class="{ 'btn-active': cropOptions[type].baseType === 'crop' }"
                        @click="setCropOption(type, 'base', 'crop')"
                      >
                        Crop
                      </button>
                      <button
                        class="join-item btn btn-xs btn-primary"
                        :class="{ 'btn-active': cropOptions[type].baseType === 'seed' }"
                        @click="setCropOption(type, 'base', 'seed')"
                      >
                        Seed
                      </button>
                      <button
                        v-if="crop?.goldValues?.hasPreserve"
                        class="join-item btn btn-xs btn-primary"
                        :class="{ 'btn-active': cropOptions[type].baseType === 'preserve' }"
                        @click="setCropOption(type, 'base', 'preserve')"
                      >
                        Jar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'info'" class="overflow-hidden overflow-y-scroll">
        <LazyHCInfo />
      </div>
    </div>
  </div>
</template>
