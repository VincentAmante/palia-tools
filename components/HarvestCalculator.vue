<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import LazyHCInfo from './garden-planner/HarvestCalculator/HCInfo.vue'
import HCTags from './garden-planner/HarvestCalculator/HCTags.vue'
import LazyHCTotal from './garden-planner/HarvestCalculator/HCTotal.vue'
import LazyHCDay from './garden-planner/HarvestCalculator/HCDay.vue'
import OptionCard from './garden-planner/HarvestCalculator/OptionCard.vue'
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
// const postLevel25 = ref(false)
// const allStarSeeds = ref(true)
// const includeReplant = ref(true)
// const includeReplantCost = ref(true)
// const baseChanceStarSeed = ref(66)
// const baseChanceNormalSeed = ref(0)
// const days = ref<number>(0)

const options = ref({
  postLevel25: false,
  allStarSeeds: true,
  includeReplant: true,
  includeReplantCost: true,
  baseChanceStarSeed: 66,
  baseChanceNormalSeed: 0,
  days: 0,
})

const harvestData = computed<ISimulateYieldResult>(() => {
  return props.layout.simulateYield({
    ...options.value,
    starChanceOverride: (options.value.baseChanceStarSeed / 100),
    baseChanceOverride: (options.value.baseChanceNormalSeed / 100),
    includeReplantCost: (options.value.includeReplantCost && options.value.includeReplant),
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

function calculateGoldValue() {
  if (harvestData.value) {
    return props.layout.calculateValue(cropOptions.value as CalculateValueOptions,
      harvestData.value,
    )
  }
}

const processedYields = computed<ICalculateValueResult>(() => {
  return calculateGoldValue() as ICalculateValueResult
})

const activeTab = ref('display')
function setTab(tab: string) {
  activeTab.value = tab
}

const activeDisplayTab = ref('overview')
function setDisplayTab(tab: 'overview' | 'day') {
  activeDisplayTab.value = tab
}

const activeOptionTab = ref('main')
function setOptionTab(tab: 'main' | 'crop') {
  activeOptionTab.value = tab
}

function setCropOption(cropType: CropType, type: 'star' | 'base', option: ProduceOptions) {
  if (type === 'star')
    cropOptions.value[cropType].starType = option

  else
    cropOptions.value[cropType].baseType = option
}

watchEffect(() => {
  if (
    options.value.baseChanceStarSeed < 0)
    options.value.baseChanceStarSeed = 0

  else if (options.value.baseChanceStarSeed > 100)
    options.value.baseChanceStarSeed = 100
})
</script>

<template>
  <div class="collapse collapse-arrow rounded-none md:rounded-lg w-full h-fit max-h-[30rem] md:mx-auto md:py-4 lg:py-0 lg:mx-0 md:px-2 z-50 overflow-visible">
    <div class="bg-primary md:rounded-lg ">
      <div class="flex flex-col gap-1">
        <div class="w-full md:bg-misc sm:rounded-lg sm:rounded-b-none p-2 sm:px-6 flex flex-col md:flex-row justify-between items-center text-misc md:text-accent">
          <div class="divider my-1 before:bg-accent after:bg-accent" />
          <h2 class="text-xl py-2 flex items-center flex-wrap gap-1">
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
        <div class="bg-accent text-misc rounded-md flex justify-center gap-1 py-2">
          <div class="font-bold flex gap-1 items-center text-lg">
            {{ Math.max(processedYields?.totalResult.day || 0, options.days) }} Days:
            <div class="flex gap-1 items-center">
              <nuxt-img
                width="1rem"
                height="1rem"
                src="/gold.webp" class="max-h-[1rem]"
                alt="Gold" format="webp"
              />{{
                processedYields?.totalResult.totalGold.toLocaleString() }}
            </div>
          </div>
          <div class="divider divider-horizontal after:bg-misc before:bg-misc" />
          <p v-if="processedYields?.totalResult.totalGold !== 0" class="flex gap-1 items-center text-lg">
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
      </div>
      <div v-show="activeTab === 'display'" class="flex flex-col px-4">
        <HCTags
          :post-level25="options.postLevel25"
          :all-star-seeds="options.allStarSeeds"
          :include-replant="options.includeReplant"
          :include-replant-cost="options.includeReplantCost"
          :base-chance-star-seed="options.baseChanceStarSeed"
          :base-chance-normal-seed="options.baseChanceNormalSeed"
        />
        <div class="tabs gap-2 pt-1">
          <div
            class="tab btn btn-sm rounded-md normal-case"
            :class="activeDisplayTab === 'overview' ? 'tab-active btn-accent' : 'btn-ghost text-misc text-opacity-50'"
            @click="setDisplayTab('overview')"
          >
            Overall
          </div>
          <div
            class="tab btn btn-sm rounded-md normal-case"
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
            class="isolate overflow-hidden overflow-y-scroll max-h-44 pb-4"
          >
            <div class="py-2">
              <div class="overflow-hidden">
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
      <div v-if="activeTab === 'options'" class="flex flex-col gap-2 px-4 max-h-80 ">
        <div class="tabs gap-2">
          <div
            class="tab btn btn-sm rounded-md normal-case"
            :class="activeOptionTab === 'main' ? 'tab-active btn-accent' : 'btn-ghost text-misc text-opacity-50'"
            @click="setOptionTab('main')"
          >
            Main
          </div>
          <div
            class="tab btn btn-sm rounded-md normal-case"
            :class="activeOptionTab === 'crop' ? 'tab-active btn-accent' : 'btn-ghost text-misc text-opacity-50'"
            @click="setOptionTab('crop')"
          >
            Crop
          </div>
        </div>
        <div class="max-h-72 overflow-y-scroll">
          <div
            v-if="activeOptionTab === 'main'"
            class="grid gap-2 pr-2 pb-4"
          >
            <OptionCard label="days" name="Days">
              <template #input>
                <div class="join">
                  <button
                    class="join-item btn btn-sm " @click="options.days = 0"
                  >
                    Auto
                  </button>
                  <input
                    v-model="options.days" class="join-item input input-sm text-lg max-w-[8rem]" type="number"
                    min="0"
                  >
                </div>
              </template>
              <template #labels>
                <p>
                  Manual override for how many days of harvest
                </p>
                <p>
                  Auto: Uses crop w/ highest growth time
                </p>
              </template>
            </OptionCard>

            <OptionCard label="postLevel25" name="Post Level 25">
              <template #input>
                <input v-model="options.postLevel25" class="toggle rounded-md" type="checkbox">
              </template>
              <template #labels>
                <p>
                  After level 25 Gardening, star seeds alone gives you the full quality
                  bonus.
                </p>
              </template>
            </OptionCard>

            <OptionCard label="allStarSeeds" name="All Star Seeds">
              <template #input>
                <input v-model="options.allStarSeeds" class="toggle rounded-md" type="checkbox">
              </template>
              <template #labels>
                <p>
                  The entire layout will use star seeds
                </p>
              </template>
            </OptionCard>

            <OptionCard label="baseChanceStarSeed" name="Star Base Chance">
              <template #input>
                <div class="join">
                  <button
                    class="join-item btn btn-sm btn-primary transition-all"
                    :class="options.baseChanceStarSeed === 66 ? 'btn-active' : ''"
                    @click="options.baseChanceStarSeed = 66"
                  >
                    66%
                  </button>
                  <button
                    class="join-item btn btn-sm btn-primary transition-all"
                    :class="options.baseChanceStarSeed === 50 ? 'btn-active' : ''"
                    @click="options.baseChanceStarSeed = 50"
                  >
                    50%
                  </button>
                  <button
                    class="join-item btn btn-sm btn-primary transition-all"
                    :class="options.baseChanceStarSeed === 33 ? 'btn-active' : ''"
                    @click="options.baseChanceStarSeed = 33"
                  >
                    33%
                  </button>
                </div>
              </template>
              <template #labels>
                <p>
                  Until base chance is confirmed, this setting will adjust the likelihood of crop quality when
                  using
                  star seeds
                </p>
              </template>
            </OptionCard>

            <OptionCard label="baseChanceNormalSeed" name="Normal Base Chance">
              <template #input>
                <div class="join">
                  <button
                    class="join-item btn btn-sm btn-primary transition-all"
                    :class="options.baseChanceNormalSeed === 0 ? 'btn-active' : ''"
                    @click="options.baseChanceNormalSeed = 0"
                  >
                    0%
                  </button>
                  <button
                    class="join-item btn btn-sm btn-primary transition-all"
                    :class="options.baseChanceNormalSeed === 33 ? 'btn-active' : ''"
                    @click="options.baseChanceNormalSeed = 33"
                  >
                    33%
                  </button>
                </div>
              </template>
              <template #labels>
                <p>
                  Same as above, but for normal seeds
                </p>
              </template>
            </OptionCard>

            <OptionCard label="includeReplant" name="Include Replant">
              <template #input>
                <input v-model="options.includeReplant" class="toggle rounded-md" type="checkbox">
              </template>
              <template #labels>
                <p>
                  Assumes that everytime a crop is harvested and there's leftover days,
                  the player will re-plant
                </p>
                <p class="font-bold">
                  If toggled off, bonuses will still be calculated but the
                  harvest days will be inaccurate
                </p>
              </template>
            </OptionCard>

            <OptionCard label="includeReplantCost" name="Include Replant Cost">
              <template #input>
                <input
                  v-model="options.includeReplantCost" class="toggle rounded-md" type="checkbox"
                  :disabled="!options.includeReplant"
                >
              </template>
              <template #labels>
                <p>
                  Accounts for the cost of re-planting
                </p>
              </template>
            </OptionCard>

            <OptionCard label="includeFertiliserCosts" name="Include Fertiliser Costs" disabled>
              <template #input>
                <input class="toggle rounded-md" type="checkbox" disabled>
              </template>
              <template #labels>
                <p>
                  <font-awesome-icon class="text-warning text-sm" :icon="['fas', 'triangle-exclamation']" />
                  Not yet supported
                </p>
              </template>
            </OptionCard>
          </div>
          <div
            v-if="activeOptionTab === 'crop'"
            class="grid gap-1 pb-4"
          >
            <div class="flex flex-col text-misc ">
              <p class="text-sm">
                Choose as to what form you wish to sell the crop
              </p>
              <p class="text-xs">
                <font-awesome-icon class="text-warning text-sm" :icon="['fas', 'triangle-exclamation']" />
                Conversion time is not yet accounted for with seeds and preserves
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-2 pr-2">
              <template v-for="(crop, type) in crops" :key="type">
                <div
                  v-if="crops[type]"
                  class="grid grid-cols-3 gap-2 items-center justify-start py-2 p-1 rounded-lg bg-accent text-misc h-fit"
                >
                  <div class="flex flex-col items-center justify-center pl-1 aspect-square">
                    <nuxt-img
                      format="webp"
                      class="w-[3.15rem] object-contain p-1 py-1 aspect-square"
                      width="3.5rem"
                      height="3.5rem"
                      :alt="crop?.type"
                      :src="crop?.image"
                    />
                    <p class="text-sm capitalize font-bold text-center">
                      {{ crop?.type }}
                    </p>
                  </div>
                  <div class="flex flex-col gap-1 px-2 pb-2 col-span-2">
                    <div class="flex flex-col text-sm font-bold">
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
                    <div class="flex flex-col font-semibold">
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
      </div>
      <div v-if="activeTab === 'info'" class="overflow-hidden overflow-y-scroll">
        <LazyHCInfo />
      </div>
    </div>
  </div>
</template>
