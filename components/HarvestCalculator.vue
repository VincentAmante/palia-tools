<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import HarvestCalculatorInfo from './garden-planner/HarvestCalculator/HarvestCalculatorInfo.vue'
import { CropType, Garden, crops } from '@/assets/scripts/garden-planner/imports'
import type { CalculateValueOptions } from '@/assets/scripts/garden-planner/classes/garden'

const props = defineProps({
  layout: {
    type: Garden,
    required: true,
  },
})
const postLevel25 = ref(false)
const allStarSeeds = ref(true)
const includeReplant = ref(true)
const includeReplantCost = ref(true)
const baseChanceStarSeed = ref(66)
const baseChanceNormalSeed = ref(0)
const days = ref<number>(0)

const harvestData = computed(() => {
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

const processedYields = computed(() => {
  const goldValueCalculations = props.layout.calculateValue(cropOptions.value as CalculateValueOptions,
    harvestData.value,
  )
  return goldValueCalculations
})

const activeTab = ref('display')
function setTab(tab: string) {
  activeTab.value = tab
}

function setCropOption(cropType: CropType, type: 'star' | 'base', option: ProduceOptions) {
  if (type === 'star')
    cropOptions.value[cropType].starType = option

  else
    cropOptions.value[cropType].baseType = option
}

function getCropImage(cropType: CropType, string: ProduceOptions) {
  if (crops && crops[cropType]) {
    // get preserve or seed image if chosen
    if (string === 'preserve')
      return crops[cropType]?.preserveImage

    else if (string === 'seed')
      return crops[cropType]?.seedImage

    else
      return crops[cropType]?.image
  }
}

watchEffect(() => {
  if (
    baseChanceStarSeed.value < 0)
    baseChanceStarSeed.value = 0

  else if (baseChanceStarSeed.value > 100)
    baseChanceStarSeed.value = 100
})

function getTooltipMessage(cropType: CropType, type: 'star' | 'base', produceAmount: number, gold: number) {
  if (type === 'star' && produceAmount > 0)
    return `${(cropOptions.value[cropType].starType !== 'crop' ? `${cropOptions.value[cropType].starType}:` : '')} ${gold.toLocaleString()} Gold`
  else if (type === 'base' && produceAmount > 0)
    return `${(cropOptions.value[cropType].baseType !== 'crop' ? `${cropOptions.value[cropType].baseType}:` : '')} ${gold.toLocaleString()} Gold`
  else if (produceAmount < 0)
    return 'Crop was deducted for replanting'
  else
    return 'No produce'
}
</script>

<template>
  <div class="sm:rounded-lg w-full h-full max-w-2xl">
    <div class="bg-primary sm:rounded-lg ">
      <div class="flex flex-col gap-1">
        <div class="w-full bg-misc sm:rounded-lg sm:rounded-b-none p-2 sm:px-6 flex justify-between items-center">
          <div class="text-lg md:text-2xl">
            Harvest Approximations <span
              class="text-xs font-normal  "
            >(WIP)</span>
          </div>
          <div class="tabs w-fit flex flex-nowrap">
            <button
              class="tab px-1 text-2xl" :class="activeTab === 'display' ? 'tab-active' : ''"
              @click="setTab('display')"
            >
              <font-awesome-icon :icon="['fas', 'table']" />
            </button>
            <button
              class="tab px-1 text-2xl" :class="activeTab === 'options' ? 'tab-active' : ''"
              @click="setTab('options')"
            >
              <font-awesome-icon :icon="['fas', 'sliders']" />
            </button>
            <button
              class="tab px-1 text-2xl" :class="activeTab === 'info' ? 'tab-active' : ''"
              @click="setTab('info')"
            >
              <font-awesome-icon :icon="['fas', 'info-circle']" />
            </button>
          </div>
        </div>
      </div>
      <div v-show="activeTab === 'display'" class="flex flex-col gap-2 py-2 overflow-hidden max-h-[486px] overflow-y-scroll">
        <div class="py-2 px-2 flex flex-col gap-2">
          <div class=" bg-accent text-misc rounded-md flex justify-center gap-4">
            <div class="font-bold flex gap-1 items-center text-xl">
              {{ Math.max(processedYields.totalResult.day, days) }} Days —
              <div class="flex gap-1 items-center">
                <img src="/gold.webp" class="max-h-[1rem]">{{
                  processedYields.totalResult.totalGold.toLocaleString() }}
              </div>
            </div>
            <p v-if="processedYields.totalResult.totalGold !== 0" class="flex gap-1 items-center text-xl">
              Average:
              <span class="flex gap-1 items-center">{{
                (Math.round(processedYields.totalResult.totalGold
                  / processedYields.totalResult.day)).toLocaleString() }} <img
                src="/gold.webp"
                class="max-h-[1rem]"
              ></span>
              / day
            </p>
          </div>
          <div class="font-semibold flex gap-2 text-sm flex-wrap">
            <p class="badge badge-primary text-xs">
              {{ (postLevel25) ? 'Lvl. 25+' : 'Pre-lvl. 25' }}
            </p>
            <p class="badge badge-secondary text-xs">
              {{ (allStarSeeds) ? 'All-star Seeds' : 'Normal Seeds' }}
            </p>
            <p v-show="(!includeReplant)" class="badge badge-accent text-xs">
              No Replant
            </p>
            <p v-if="(includeReplantCost && includeReplant)" class="badge badge-accent text-xs">
              Incl. Replant
              Costs
            </p>
            <p v-if="!(postLevel25) && allStarSeeds" class="badge badge-accent text-xs">
              {{ baseChanceStarSeed
              }}% Star Seed
              Quality
            </p>

            <p v-if="!(allStarSeeds)" class="badge badge-accent text-xs">
              {{ baseChanceNormalSeed }}% Normal Seed
              Quality
            </p>
            <p class="badge badge-warning text-xs">
              No Fertiliser Costs
            </p>
          </div>
          <div class="flex flex-wrap max-w-sm gap-1 bg-accent p-1 rounded-md">
            <template v-for="(crop, cropType) of processedYields.totalResult.crops" :key="cropType">
              <div
                v-if="(crop.star.produce !== 0)" class="tooltip capitalize"
                :data-tip="getTooltipMessage(cropType, 'star', crop.star.produce, crop.star.gold)"
              >
                <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
                  <nuxt-img
                    :src="getCropImage(cropType, cropOptions[cropType].starType)"
                    class="max-w-[2.25rem] object-contain aspect-square"
                  />
                  <p
                    class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
                  >
                    {{ crop.star.produce }}
                  </p>
                  <p class="absolute bottom-0 left-0">
                    <font-awesome-icon class="text-quality-increase text-sm" :icon="['fas', 'star']" />
                  </p>
                </div>
              </div>
              <div
                v-if="(crop.star.cropRemainder > 0)" class="tooltip"
                data-tip="Unsold crops for further processing"
              >
                <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
                  <nuxt-img
                    :src="crops[cropType]?.image"
                    class="max-w-[2.25rem] object-contain aspect-square"
                  />
                  <p
                    class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
                  >
                    {{ crop.star.cropRemainder }}
                  </p>
                  <p class="absolute bottom-0 left-0">
                    <font-awesome-icon class="text-quality-increase text-sm" :icon="['fas', 'star']" />
                  </p>
                  <p class="absolute top-0 right-0">
                    <font-awesome-icon class="text-white text-sm" :icon="['fas', 'recycle']" />
                  </p>
                </div>
              </div>
              <div
                v-if="(harvestData.harvestTotal.seedsRemainder[cropType].star > 0)"
                class="tooltip tooltip-right" data-tip="Excess seeds for replanting"
              >
                <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
                  <nuxt-img
                    :src="getCropImage(cropType, 'seed')"
                    class="max-w-[2.25rem] object-contain aspect-square"
                  />
                  <p
                    class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
                  >
                    {{ harvestData.harvestTotal.seedsRemainder[cropType].star }}
                  </p>
                  <p class="absolute bottom-0 left-0">
                    <font-awesome-icon class="text-quality-increase text-sm" :icon="['fas', 'star']" />
                  </p>
                  <p class="absolute top-0 right-0">
                    <font-awesome-icon
                      class="font-bold text-white text-lg"
                      :icon="['fas', 'turn-down']"
                    />
                  </p>
                </div>
              </div>
              <div
                v-if="(crop.base.produce > 0)" class="tooltip"
                :data-tip="getTooltipMessage(cropType, 'base', crop.base.produce, crop.base.gold)"
              >
                <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
                  <nuxt-img
                    :src="getCropImage(cropType, cropOptions[cropType].baseType)"
                    class="max-w-[2.25rem] object-contain aspect-square"
                  />
                  <p
                    class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
                  >
                    {{ crop.base.produce }}
                  </p>
                </div>
              </div>
              <div
                v-if="(crop.base.cropRemainder > 0)" class="tooltip"
                data-tip="Unsold crops for further processing"
              >
                <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
                  <nuxt-img
                    :src="crops[cropType]?.image"
                    class="max-w-[2.25rem] object-contain aspect-square"
                  />
                  <p
                    class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
                  >
                    {{ crop.base.cropRemainder }}
                  </p>
                  <p class="absolute top-0 right-0">
                    <font-awesome-icon class="text-white text-sm" :icon="['fas', 'recycle']" />
                  </p>
                </div>
              </div>
              <div
                v-if="(harvestData.harvestTotal.seedsRemainder[cropType].base > 0)"
                class="tooltip tooltip-right" data-tip="Excess seeds for replanting"
              >
                <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
                  <nuxt-img
                    :src="getCropImage(cropType, 'seed')"
                    class="max-w-[2.25rem] object-contain aspect-square"
                  />
                  <p
                    class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
                  >
                    {{ harvestData.harvestTotal.seedsRemainder[cropType].base }}
                  </p>
                  <p class="absolute top-0 right-0">
                    <font-awesome-icon
                      class="font-bold text-white text-lg"
                      :icon="['fas', 'turn-down']"
                    />
                  </p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="isolate">
          <div class="h-full">
            <div class="overflow-x-hidden px-4">
              <table v-if="harvestData" class="table px-4 bg-accent text-misc">
                <tbody class="h-full">
                  <tr v-for="(harvest, index) of processedYields.result" :key="index">
                    <td class="flex gap-1 items-end flex-wrap w-full max-w-md">
                      <div class="flex flex-col w-full">
                        <p class="font-semibold text-xs">
                          Day {{ harvest.day }}
                        </p>
                        <div
                          class="flex flex-wrap max-w-xl w-fit items-start justify-start gap-1"
                        >
                          <template v-for="(crop, cropType) of harvest.crops" :key="cropType">
                            <div
                              v-if="(crop.star.produce !== 0)"
                              class="tooltip tooltip-right"
                              :data-tip="getTooltipMessage(cropType, 'star', crop.star.produce, crop.star.gold)"
                            >
                              <div
                                class="relative h-full aspect-square p-1 flex flex-col items-center justify-center"
                              >
                                <nuxt-img
                                  :src="getCropImage(cropType, cropOptions[cropType].starType)"
                                  class="max-w-[2.25rem] object-contain aspect-square"
                                />
                                <p
                                  class="absolute top-0 right-0 text-xs p-[1px] px-[6px] text-center align-middle rounded-lg bg-neutral bg-opacity-40"
                                  :class="(crop.star.produce < 0) ? 'text-error font-black' : 'text-accent font-semibold'"
                                >
                                  {{ crop.star.produce }}
                                </p>
                                <p class="absolute bottom-0 left-0">
                                  <font-awesome-icon
                                    class="text-quality-increase text-sm"
                                    :icon="['fas', 'star']"
                                  />
                                </p>
                                <p
                                  v-show="(crop.star.produce < 0)"
                                  class="absolute top-0 right-0"
                                >
                                  <font-awesome-icon
                                    class="text-error text-sm"
                                    :icon="['fas', 'seedling']"
                                  />
                                </p>
                              </div>
                            </div>
                            <div
                              v-if="(crop.star.cropRemainder > 0)"
                              class="tooltip tooltip-right"
                            >
                              <div
                                class="relative h-full aspect-square p-1 flex flex-col items-center justify-center"
                              >
                                <nuxt-img
                                  :src="crops[cropType]?.image"
                                  class="max-w-[2rem] object-contain aspect-square"
                                />
                                <p
                                  class="absolute top-0 right-0 text-xs p-[1px] px-[6px] text-center align-middle rounded-lg bg-neutral bg-opacity-40 text-warning"
                                >
                                  {{ crop.star.cropRemainder }}
                                </p>
                                <p class="absolute bottom-0 left-0">
                                  <font-awesome-icon
                                    class="text-quality-increase text-sm"
                                    :icon="['fas', 'star']"
                                  />
                                </p>

                                <p class="absolute top-0 right-0">
                                  <font-awesome-icon
                                    class="text-white text-sm"
                                    :icon="['fas', 'recycle']"
                                  />
                                </p>
                              </div>
                            </div>
                            <div
                              v-if="(harvestData.harvests[index].seedsRemainder[cropType].star > 0)"
                              class="tooltip tooltip-right"
                              data-tip="Excess seeds for replanting"
                            >
                              <div
                                class="relative h-full aspect-square p-1 flex flex-col items-center justify-center"
                              >
                                <nuxt-img
                                  :src="getCropImage(cropType, 'seed')"
                                  class="max-w-[2.25rem] object-contain aspect-square"
                                />
                                <p
                                  class="absolute top-0 right-0 text-xs p-[1px] px-[6px] text-center align-middle rounded-lg bg-neutral bg-opacity-40"
                                >
                                  {{
                                    harvestData.harvests[index].seedsRemainder[cropType].star
                                  }}
                                </p>
                                <p class="absolute bottom-0 left-0">
                                  <font-awesome-icon
                                    class="text-quality-increase text-sm"
                                    :icon="['fas', 'star']"
                                  />
                                </p>
                                <p class="absolute top-0 right-0">
                                  <font-awesome-icon
                                    class="font-bold text-white text-lg"
                                    :icon="['fas', 'turn-down']"
                                  />
                                </p>
                              </div>
                            </div>
                            <div
                              v-if="(crop.base.produce !== 0)"
                              class="tooltip tooltip-right"
                              :data-tip="getTooltipMessage(cropType, 'base', crop.base.produce, crop.base.gold)"
                            >
                              <div
                                class="relative h-full aspect-square p-1 flex flex-col items-center justify-center"
                              >
                                <nuxt-img
                                  :src="getCropImage(cropType, cropOptions[cropType].baseType)"
                                  class="max-w-[2.25rem] object-contain aspect-square"
                                />
                                <p
                                  class="absolute top-0 right-0 text-xs p-[1px] px-[6px] text-center align-middle rounded-lg bg-neutral bg-opacity-40"
                                  :class="(crop.base.produce < 0) ? 'text-error font-black' : 'text-accent font-bold'"
                                >
                                  {{ crop.base.produce }}
                                </p>
                              </div>
                            </div>
                            <div v-if="(crop.base.cropRemainder > 0)" class="tooltip">
                              <div
                                class="relative h-full aspect-square p-1 flex flex-col items-center justify-center"
                              >
                                <nuxt-img
                                  :src="crops[cropType]?.image"
                                  class="max-w-[2rem]"
                                />
                                <p
                                  class="absolute top-0 right-0 text-xs p-[1px] px-[6px] text-center align-middle rounded-lg bg-neutral bg-opacity-40"
                                >
                                  {{ crop.base.cropRemainder }}
                                </p>

                                <p class="absolute top-0 right-0">
                                  <font-awesome-icon
                                    class="text-white text-sm"
                                    :icon="['fas', 'recycle']"
                                  />
                                </p>
                              </div>
                            </div>
                            <div
                              v-if="(harvestData.harvests[index].seedsRemainder[cropType].base > 0)"
                              class="tooltip tooltip-right"
                              data-tip="Excess seeds for replanting"
                            >
                              <div
                                class="relative h-full aspect-square p-1 flex flex-col items-center justify-center"
                              >
                                <nuxt-img
                                  :src="getCropImage(cropType, 'seed')"
                                  class="max-w-[2.25rem] object-contain aspect-square"
                                />
                                <p
                                  class="absolute top-0 right-0 text-xs p-[1px] px-[6px] text-center align-middle rounded-lg bg-neutral bg-opacity-40"
                                >
                                  {{
                                    harvestData.harvests[index].seedsRemainder[cropType].base
                                  }}
                                </p>
                                <p class="absolute top-0 right-0">
                                  <font-awesome-icon
                                    class="font-bold text-white text-lg"
                                    :icon="['fas', 'turn-down']"
                                  />
                                </p>
                              </div>
                            </div>
                          </template>
                        </div>
                      </div>
                    </td>
                    <td class="">
                      <p class="flex gap-1 font-bold items-center pr-1">
                        <nuxt-img format="webp" src="/gold.webp" class="max-h-[1.5rem]" />{{
                          harvest.totalGold.toLocaleString() }}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div v-show="activeTab === 'options'" class="flex flex-col gap-2 py-4 overflow-hidden max-h-[486px] overflow-y-scroll">
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
      <div v-show="activeTab === 'info'" class="overflow-hidden max-h-[486px] overflow-y-scroll">
        <HarvestCalculatorInfo />
      </div>
    </div>
  </div>
</template>
