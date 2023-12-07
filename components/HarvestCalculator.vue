<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useStorage } from '@vueuse/core'
import LazyHCInfo from './garden-planner/HarvestCalculator/HCInfo.vue'
import HCTags from './garden-planner/HarvestCalculator/HCTags.vue'
import LazyHCTotal from './garden-planner/HarvestCalculator/HCTotal.vue'
import LazyHCDay from './garden-planner/HarvestCalculator/HCDay.vue'
import OptionCard from './garden-planner/HarvestCalculator/OptionCard.vue'
import CropOptions from './garden-planner/HarvestCalculator/CropOptions.vue'
import CrafterDataDisplay from './garden-planner/HarvestCalculator/CrafterDataDisplay.vue'
import ProduceManagerSettings from './garden-planner/HarvestCalculator/ProduceManagerSettings.vue'
import type { ICalculateValueResult, ICropOption, ICropOptions, ISimulateYieldResult } from '@/assets/scripts/garden-planner/imports'
import { CropType, Garden } from '@/assets/scripts/garden-planner/imports'
import type { CalculateValueOptions } from '@/assets/scripts/garden-planner/classes/Garden'
import AppDividerAlt from '@/components/AppDividerAlt.vue'
import { useTakingScreenshot } from '@/stores/useIsTakingScreenshot'
import type { IShippingBin } from '~/assets/scripts/garden-planner/classes/ShippingBin'
import ShippingBin from '~/assets/scripts/garden-planner/classes/ShippingBin'
import type { CropOption as ProduceManagerCropOption } from '~/assets/scripts/garden-planner/classes/Crafters/ProduceManager'
import { ProduceManager } from '~/assets/scripts/garden-planner/classes/Crafters/ProduceManager'

const props = defineProps({
  layout: {
    type: Garden,
    required: true,
  },
})

const produceManager = ref(new ProduceManager())

const shippingBin = ref<IShippingBin>(new ShippingBin())

const isTakingScreenshot = useTakingScreenshot()

const gardenTilesAreWide = computed(() => {
  return props.layout.plots[0].length > 3
})

const options = useStorage('approximator-options-NOV1023', {
  days: 0,
  useStarSeeds: true,
  includeReplant: true,
  includeReplantCost: true,
  useGrowthBoost: false,
  level: 0,
})

// const harvestData = computed<ISimulateYieldResult>(() => {
//   return props.layout.simulateYield({
//     ...options.value,
//   })
// })

const harvestData = ref<ISimulateYieldResult | undefined>(props.layout.simulateYield({
  ...options.value,
}))

watchPostEffect(() => {
  harvestData.value = props.layout.simulateYield({
    ...options.value,
  })
})

// Debounce to prevent too many calculations
const harvestDataDebounced = refDebounced(harvestData, 200)

type ProduceOptions = 'crop' | 'seed' | 'preserve'

const cropOptions = ref(Object.values(CropType).reduce((acc, cropType) => {
  acc[cropType] = {
    starType: 'crop',
    baseType: 'crop',
  }
  return acc
}, {} as Record<CropType, { starType: ProduceOptions; baseType: ProduceOptions }>))

function calculateGoldValue() {
  if (harvestDataDebounced.value) {
    return props.layout.calculateValue(cropOptions.value as CalculateValueOptions,
      harvestDataDebounced.value,
    )
  }
}

const processedYields = ref<ICalculateValueResult | undefined>(calculateGoldValue())

function triggerGoldCalculations() {
  if (!harvestDataDebounced.value)
    return

  shippingBin.value.clear()
  produceManager.value.logs = harvestDataDebounced.value.harvests
  produceManager.value.simulate(shippingBin.value)
}

watchPostEffect(async () => {
  await triggerGoldCalculations()

  processedYields.value = calculateGoldValue()
})

const activeTab = ref('display')
function setTab(tab: string) {
  activeTab.value = tab
}

const activeDisplayTab = ref('overview')
type DisplayTab = 'overview' | 'day' | 'crafter'
function setDisplayTab(tab: DisplayTab) {
  activeDisplayTab.value = tab
}

const activeOptionTab = ref('main')
type OptionTab = 'main' | 'crop' | 'crafter'
function setOptionTab(tab: OptionTab) {
  activeOptionTab.value = tab
}

function setCropOption(cropOption: ICropOption, option: ProduceManagerCropOption) {
  produceManager.value.setCropOption(cropOption.cropType, cropOption.isStar, option)
}

function setCropOptions(cropOptions: ICropOptions) {
  produceManager.value.cropOptions = cropOptions
}

watchEffect(() => {
  if (options.value.level < 0)
    options.value.level = 0
})
</script>

<template>
  <section
    class="transition-all lg:max-w-2xl lg:h-fit rounded-none z-50 overflow-visible w-full xl:max-w-3xl pointer-events-none lg:mb-4"
    :class="[
      gardenTilesAreWide ? '!max-w-none px-0' : 'lg:pl-20 xl:pl-2 xl:px-4 lg:px-2',
      isTakingScreenshot.get && !gardenTilesAreWide ? 'max-w-[46rem] px-4' : '',
    ]"
  >
    <div
      class="bg-primary flex flex-col pointer-events-auto"
      :class="[
        isTakingScreenshot.get ? 'rounded-lg' : 'pt-2 md:pt-0 pb-6 lg:pb-0',
        gardenTilesAreWide ? 'rounded-none' : 'lg:rounded-lg ',
      ]"
    >
      <div class="flex flex-col gap-1">
        <div
          class="w-full flex flex-col lg:flex-row justify-between items-center lg:bg-misc lg:rounded-lg lg:rounded-b-none p-1 sm:px-6 lg:text-accent"
          :class="[
            isTakingScreenshot.get ? 'bg-misc px-6 rounded-lg rounded-b-none' : 'text-misc gap-2',
            gardenTilesAreWide ? '!bg-primary !flex-col' : '',
          ]"
        >
          <AppDividerAlt
            class="w-full sm:hidden order-1"
            :class="isTakingScreenshot.get || gardenTilesAreWide ? 'hidden' : ''"
          />
          <h2
            class="text-2xl py-1 flex items-center flex-wrap gap-1 order-2"
            :class="gardenTilesAreWide ? 'text-center text-misc' : ''"
          >
            Harvest Approximations
          </h2>
          <div
            v-show="(activeTab !== 'info' && !isTakingScreenshot.get)"
            class="mx-4 py-2 w-full lg:hidden"
            :class="gardenTilesAreWide ? 'order-first' : 'md:order-default'"
          >
            <div class="bg-accent text-misc rounded-md font-semibold flex flex-col xl:flex-row items-center justify-center md:gap-1 py-2">
              <div
                class="tooltip tooltip-top"
                data-tip="The last harvest before approximations are made"
              >
                <div class="flex gap-1 items-center ">
                  Last Harvest: Day {{ Math.max(processedYields?.totalResult.day || 0, options.days) }} —
                  <div class="flex gap-1 items-center">
                    <nuxt-img
                      width="16"
                      height="16"
                      src="/gold.webp" class="max-h-[1rem]"
                      :srcset="undefined"
                      placeholder
                      alt="Gold" format="webp"
                    />{{
                      shippingBin.totalGold.toLocaleString()
                    }}
                  </div>
                </div>

                <p
                  v-if="produceManager.highestTime !== 0"
                  class="text-xs"
                >
                  Total Time: {{ produceManager.highestExactTime }}
                </p>
              </div>
              <div
                v-if="shippingBin.totalGold !== 0"
                class="divider divider-horizontal after:bg-misc before:bg-misc"
              />
              <div
                v-show="shippingBin.totalGold !== 0"
                class="tooltip tooltip-top"
                data-tip="Raw average is without processing time"
              >
                <p class="flex gap-1 items-center">
                  Average:
                  <span class="flex gap-1 items-center"><nuxt-img
                    src="/gold.webp"
                    class="max-h-[1rem]"
                    format="webp"
                    alt="Gold"
                    width="16"
                    height="16"
                    :srcset="undefined"
                  />{{
                    (Math.round(shippingBin.totalGold / produceManager.highestTime)).toLocaleString() }}</span>/ day
                </p>
              </div>
            </div>
          </div>
          <div
            v-if="!isTakingScreenshot.get"
            class="w-full justify-evenly flex flex-nowrap bg-misc rounded-md px-4 py-1 max-w-[22rem] order-3 text-accent"
            :class="gardenTilesAreWide ? 'justify-center py-2' : 'md:px-0 md:gap-2 lg:w-fit '"
          >
            <button
              id="approximator-display-tab"
              aria-label="Display Tab"
              class="btn btn-square btn-ghost btn-sm text-2xl" :class="activeTab === 'display' ? 'btn-active' : ''"
              @click="setTab('display')"
            >
              <font-awesome-icon :icon="['fas', 'table']" />
            </button>
            <button
              id="approximator-options-tab"
              aria-label="Options Tab"
              class="btn btn-square btn-ghost btn-sm text-2xl" :class="activeTab === 'options' ? 'btn-active' : ''"
              @click="setTab('options')"
            >
              <font-awesome-icon :icon="['fas', 'sliders']" />
            </button>
            <button
              id="approximator-info-tab"
              aria-label="Info Tab"
              class="btn btn-circle btn-ghost btn-sm text-2xl" :class="activeTab === 'info' ? 'btn-active' : ''"
              @click="setTab('info')"
            >
              <font-awesome-icon :icon="['fas', 'info-circle']" />
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="(activeTab !== 'info' || isTakingScreenshot.get)"
        class="px-4 py-2 "
        :class="[
          isTakingScreenshot.get ? '' : 'hidden lg:block',
          gardenTilesAreWide ? 'order-first' : '',
        ]"
      >
        <div class="bg-accent text-misc rounded-md font-semibold flex flex-col xl:flex-row items-center justify-center md:gap-1 py-2">
          <div class="flex flex-col items-center">
            <div
              class="tooltip tooltip-top"
              data-tip="The last harvest before approximations are made"
            >
              <div
                v-if="processedYields?.totalResult.day !== undefined"
                class="flex gap-1 items-center"
              >
                Last Harvest: Day
                {{ Math.max(processedYields.totalResult.day || 0, options.days) }} —
                <div class="flex gap-1 items-center">
                  <nuxt-img
                    width="16"
                    height="16"
                    src="/gold.webp" class="max-h-[1rem]"
                    :srcset="undefined"
                    placeholder
                    alt="Gold" format="webp"
                  />{{
                    shippingBin.totalGold.toLocaleString() }}
                </div>
              </div>
            </div>

            <p
              v-if="produceManager.highestTime !== 0"
              class="text-sm font-normal"
            >
              Total Time: <span class="font-bold">{{ produceManager.highestExactTime }}</span>
            </p>
          </div>
          <div
            v-if="shippingBin.totalGold !== 0"
            class="divider divider-horizontal after:bg-misc before:bg-misc"
          />
          <div
            v-if="shippingBin.totalGold !== 0"
            class="tooltip tooltip-top"
            data-tip="Average gold per Palian Day/Real Life Hour"
          >
            <p class="flex gap-1 items-center">
              Average:
              <span class="flex gap-1 items-center"><nuxt-img
                src="/gold.webp"
                class="max-h-[1rem]"
                format="webp"
                alt="Gold"
                width="16"
                height="16"
                :srcset="undefined"
              />{{
                (Math.round(shippingBin.totalGold
                  / (Math.ceil(produceManager.highestTime)))).toLocaleString() }}</span>/ day
            </p>
          </div>
        </div>
      </div>
      <div v-show="(isTakingScreenshot.get) || activeTab === 'display'" class="flex flex-col px-4">
        <HCTags
          :use-star-seeds="options.useStarSeeds"
          :include-replant="options.includeReplant"
          :include-replant-cost="options.includeReplantCost"
          :use-growth-boost="options.useGrowthBoost"
          :level="options.level"
        />
        <div v-if="!isTakingScreenshot.get" class="tabs gap-2">
          <div
            class="tab btn btn-sm rounded-md normal-case"
            :class="activeDisplayTab === 'overview' ? 'tab-active btn-accent' : 'btn-ghost text-misc'"
            @click="setDisplayTab('overview')"
          >
            Overview
          </div>
          <div
            class="tab btn btn-sm rounded-md normal-case"
            :class="activeDisplayTab === 'day' ? 'tab-active btn-accent' : 'btn-ghost text-misc '"
            @click="setDisplayTab('day')"
          >
            Day by Day
          </div>
          <div
            class="tab btn btn-sm rounded-md normal-case"
            :class="activeDisplayTab === 'crafter' ? 'tab-active btn-accent' : 'btn-ghost text-misc '"
            @click="setDisplayTab('crafter')"
          >
            Crafter Info
          </div>
        </div>
        <div class="pt-2">
          <div
            v-if="(isTakingScreenshot.get) || activeDisplayTab === 'overview'"
            class="flex flex-col gap-2 pb-3"
          >
            <LazyHCTotal
              :processed-yields="processedYields as ICalculateValueResult"
              :harvest-data="harvestDataDebounced as ISimulateYieldResult"
              :crop-options="cropOptions as Record<CropType, { starType: ProduceOptions; baseType: ProduceOptions }>"
            />
          </div>

          <LazyHCDay
            v-if="(!(isTakingScreenshot.get) && activeDisplayTab === 'day' && harvestDataDebounced)"
            class="pb-4"
            :processed-yields="processedYields as ICalculateValueResult"
            :harvest-data="harvestDataDebounced as ISimulateYieldResult"
            :crop-options="cropOptions as Record<CropType, { starType: ProduceOptions; baseType: ProduceOptions }>"
          />
          <div
            v-if="(!(isTakingScreenshot.get) && activeDisplayTab === 'crafter' && harvestDataDebounced)"
            class="grid"
          >
            <CrafterDataDisplay
              :crafters-data="produceManager.crafterData"
            />
          </div>
        </div>
      </div>

      <div v-if="!(isTakingScreenshot.get) && activeTab === 'options'" class="flex flex-col gap-2 px-4 max-h-96 transition-all ">
        <div class="tabs gap-2">
          <div
            class="tab btn btn-sm rounded-md normal-case"
            :class="activeOptionTab === 'main' ? 'tab-active btn-accent' : 'btn-ghost text-misc text-opacity-50'"
            @click="setOptionTab('main')"
          >
            Garden
          </div>
          <div
            class="tab btn btn-sm rounded-md normal-case"
            :class="activeOptionTab === 'crop' ? 'tab-active btn-accent' : 'btn-ghost text-misc text-opacity-50'"
            @click="setOptionTab('crop')"
          >
            Crop
          </div>
          <div
            class="tab btn btn-sm rounded-md normal-case"
            :class="activeOptionTab === 'crafter' ? 'tab-active btn-accent' : 'btn-ghost text-misc text-opacity-50'"
            @click="setOptionTab('crafter')"
          >
            Crafter
          </div>
        </div>

        <!-- box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset; -->
        <div class=" max-h-[19.75rem] overflow-y-scroll mb-4 rounded-lg rounded-r-none border border-misc border-opacity-50 p-2">
          <div
            v-if="activeOptionTab === 'main'"
            class="grid gap-2 pr-2 pb-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
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
                  <span class="font-bold uppercase">Auto:</span> Uses crop w/ highest growth time
                </p>
              </template>
            </OptionCard>

            <OptionCard label="level" name="Gardening Level">
              <template #input>
                <div class="join ">
                  <button
                    class="join-item btn btn-sm  text-primary" @click="options.level = 0"
                  >
                    0
                  </button>
                  <button
                    class="join-item btn btn-sm  text-primary" @click="options.level = 10"
                  >
                    10
                  </button>
                  <input
                    v-model="options.level" class="input input-sm text-lg max-w-[5rem] join-item text-accent" type="number"
                    min="0"
                  >
                  <button
                    class="join-item btn btn-sm text-primary" @click="options.level = 25"
                  >
                    25
                  </button>
                  <button
                    class="join-item btn btn-sm text-primary " @click="options.level = 50"
                  >
                    50
                  </button>
                </div>
              </template>
              <template #labels>
                <p>
                  Decides base star chance of crops
                </p>
                <p>
                  Base Star Chance: <code class="bg-misc text-accent rounded-sm px-2">{{ Math.min(100, (0.25 + (options.useStarSeeds ? 0.25 : 0) + (0.02 * options.level)) * 100) }}%</code>
                </p>
                <p>Formula in info</p>
              </template>
            </OptionCard>

            <OptionCard label="useStarSeeds" name="All Star Seeds">
              <template #input>
                <input v-model="options.useStarSeeds" class="toggle rounded-md" type="checkbox">
              </template>
              <template #labels>
                <p>
                  The garden will use star seeds
                </p>
              </template>
            </OptionCard>

            <OptionCard label="includeReplant" name="Include Replant">
              <template #input>
                <input v-model="options.includeReplant" class="toggle rounded-md" type="checkbox">
              </template>
              <template #labels>
                <p>
                  Replants the crops after harvest until the last day
                </p>
                <p
                  v-show="!options.includeReplant"
                  class="font-bold"
                >
                  Off: Bonuses will still be calculated but the
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

            <OptionCard label="useGrowthBoost" name="Use Growth Boost">
              <template #input>
                <input v-model="options.useGrowthBoost" class="toggle rounded-md" type="checkbox">
              </template>
              <template #labels>
                <p>
                  Factors in growth boost when simulating yields, does not account for any RNG and is theoretical
                </p>
                <p class="text-warning py-1">
                  <font-awesome-icon class="text-warning text-sm" :icon="['fas', 'triangle-exclamation']" />
                  Likely bugged as of 0.169
                  <NuxtLink
                    class="text-misc pl-1 underline"
                    to="https://docs.google.com/document/d/1f4MQHjEC1RCNpDUz1I3eg2tioD_6yBmW0XWsVxUOJ1Y/edit" target="_blank"
                  >
                    <font-awesome-icon class="text-sm" :icon="['fas', 'arrow-up-right-from-square']" />
                    (Source)
                  </NuxtLink>
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
            class="grid gap-1 pb-2"
          >
            <CropOptions
              :crop-options="produceManager.cropOptions as ICropOptions"
              :has-max-crafter-limit="produceManager.managerSettings.useCrafterLimit"
              :is-dedicated="produceManager.distributionMethod === 'Dedicated'"
              @update:crop-options="(cropOptions) => setCropOptions(cropOptions)"
              @update:crop-option="(cropOption) => setCropOption(cropOption.cropOption, cropOption.option)"
            />
          </div>
          <div
            v-if="activeOptionTab === 'crafter'"
            class="grid gap-1 pb-2"
          >
            <ProduceManagerSettings
              :manager-settings="produceManager.managerSettings"
              :crafter-settings="produceManager.crafterSettings"
              :crafter-counts="produceManager.manualCrafterCounts"
              :distribution-method="produceManager.distributionMethod"
              @update-distribution-method="(method) => produceManager.distributionMethod = method"
            />
          </div>
        </div>
      </div>
      <div v-if="!(isTakingScreenshot.get) && activeTab === 'info'" class="overflow-hidden overflow-y-scroll">
        <LazyHCInfo class="max-h-[26.5rem]" />
      </div>
    </div>
  </section>
</template>
