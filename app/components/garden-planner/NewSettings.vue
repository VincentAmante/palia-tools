<script setup lang="ts">
import OptionCard from './HarvestCalculator/OptionCard.vue'
import SettingsMinutesDisplay from './SettingsMinutesDisplay.vue'
import ItemDisplayAlt from './HarvestCalculator/ItemDisplayAlt.vue'
import type { ProcessorSetting, ProcessorSettings } from '~/assets/scripts/garden-planner/classes/processor'
import { type ICropNameWithGrowthDiff, ItemType } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { CropType, getCropFromType } from '~/assets/scripts/garden-planner/imports'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import SettingsCodeSettings from './OutputDisplay/SettingsCodeSettings.vue'

const harvester = useHarvester()
const starBaseChance = computed(() => Math.trunc(Math.min(100, (0.25 + (harvester.settings.useStarSeeds ? 0.25 : 0) + (harvester.settings.level * 0.02)) * 100)))
const processor = useProcessor()


// Allows us to save settings of unselected crops
const activeProcessorSettings = computed(() => {
  const activeSettings = {
    cropSettings: new Map() as Map<ICropNameWithGrowthDiff, ProcessorSetting>,
    crafterSetting: 0,
    goldAverageSetting: 'crafterTime' as 'crafterTime' | 'growthTick'
  } satisfies ProcessorSettings

  for (const [cropId, setting] of processor.settings.cropSettings) {
    if (setting.isActive && setting.count > 0)
      activeSettings.cropSettings.set(cropId, setting)
  }

  activeSettings.goldAverageSetting = processor.settings.goldAverageSetting

  return activeSettings
})

const activeCrafterCount = computed(() => {
  return Array
    .from(activeProcessorSettings.value.cropSettings.values())
    .reduce((sum, setting) => {
      return (setting.processAs !== ItemType.Crop) ? sum + setting.crafters : sum
    }, 0);
})

function getCropImgSrc(cropType: CropType) {
  if (cropType === CropType.None || cropType === null) {
    return {
      src: '',
      alt: '',
    }
  }
  else {
    const crop = getCropFromType(cropType)
    return {
      src: crop?.image,
      alt: cropType,
    }
  }
}

const activeTab = ref('Harvest')

function updateSettings() {
  processor.updateSettings(Object.assign({}, processor.settings))
  processor.simulateProcessing(harvester.totalHarvest)
}


function onChangeSettings() {
  updateSettings()
}

const isOverCrafterLimit = computed(() => activeCrafterCount.value > 30)

const isUnderleveledForSeeder = computed(() => harvester.settings.level < 5)
const isUnderleveledForPreserveJar = computed(() => harvester.settings.level < 8)

const highestTime = computed(() => {
  return processor.processor.highestCraftingTime
})
</script>

<template>
  <section id="planner-settings" class="relative flex flex-col gap-1 py-2 ">
    <div class="flex justify-between">
      <nav role="tablist" class="font-semibold tabs tabs-box w-fit join">
        <button role="tab" class="tab join-item" :class="(activeTab === 'Harvest') ? 'tab-active' : ''"
          @click="activeTab = 'Harvest'" :aria-selected="activeTab === 'Harvest'">
          <p>General</p>
        </button>
        <button role="tab" class="tab join-item" :class="(activeTab === 'Crops') ? 'tab-active' : ''"
          @click="activeTab = 'Crops'" :aria-selected="activeTab === 'Crops'">
          <p>Crops</p>
        </button>
        <button role="tab" class="tab join-item" :class="(activeTab === 'Misc') ? 'tab-active' : ''"
          @click="activeTab = 'Misc'" :aria-selected="activeTab === 'Misc'">
          <p>Presets</p>
        </button>
      </nav>
    </div>

    <section v-if="activeTab === 'Harvest'" class="relative h-full isolate">
      <div v-if="activeProcessorSettings.cropSettings.size > 0" aria-hidden
        class="absolute bottom-0 z-10 w-full rounded-md pointer-events-none opacity-90 h-1/4 max-h-12 bg-linear-to-b from-transparent to-primary dark:to-palia-blue-secondary" />
      <ul
        class="grid max-h-[488px] gap-1 overflow-y-auto pr-2 rounded-md max-w-full scrollbar scrollbar-w-1 scrollbar-thumb-rounded-xl scrollbar-thumb-palia-blue dark:scrollbar-thumb-accent">
        <OptionCard label="days" name="Days">
          <template #input>
            <div class="join">
              <button class="join-item btn btn-sm " @click="harvester.settings.days = -1" aria-label="Set Days to LCM">
                LCM
              </button>
              <button class="join-item btn btn-sm " @click="harvester.settings.days = 0" aria-label="Set Days to Auto">
                Auto
              </button>
              <input v-model="harvester.settings.days" class="join-item input input-sm text-lg max-w-[6rem] text-accent"
                type="number" min="0">
              <button class="join-item btn btn-sm " @click="harvester.settings.days = 30" aria-label="Set Days to 30">
                30
              </button>
              <button class="join-item btn btn-sm " @click="harvester.settings.days = 180" aria-label="Set Days to 180">
                180
              </button>
            </div>
          </template>
          <template #labels>
            <p>
              Manual override for how many days of harvest
            </p>
            <p>
              <span class="font-bold">Auto:</span> Uses crop w/ highest growth time
            </p>
            <p>
              <span class="font-bold">LCM:</span> Finds a day where all crops are harvestable
            </p>
          </template>
        </OptionCard>
        <OptionCard label="level" name="Gardening Level">
          <template #input>
            <div class="join ">
              <button class="join-item btn btn-sm text-primary" @click="harvester.settings.level = 0"
                aria-label="Set Level to 0">
                0
              </button>
              <button class="join-item btn btn-sm text-primary" @click="harvester.settings.level = 10"
                aria-label="Set Level to 10">
                10
              </button>
              <input v-model="harvester.settings.level"
                class="input input-sm text-lg max-w-[5rem] join-item text-accent" type="number" min="0"
                aria-label="Gardening Level">
              <button class="join-item btn btn-sm text-primary" @click="harvester.settings.level = 25"
                aria-label="Set Level to 25">
                25
              </button>
              <button class="join-item btn btn-sm text-primary " @click="harvester.settings.level = 50"
                aria-label="Set Level to 50">
                50
              </button>
            </div>
          </template>
          <template #labels>
            <p>
              Decides base star chance of crops
            </p>
            <p>
              Base Star Chance: <code class="px-2 rounded-xs bg-misc text-accent">{{ starBaseChance }}%</code>
            </p>
            <p>Formula in info</p>
          </template>
        </OptionCard>

        <OptionCard label="allStarSeeds" name="All Star Seeds">
          <template #input>
            <input v-model="harvester.settings.useStarSeeds" class="toggle" type="checkbox" aria-label="Use Star Seeds">
          </template>
          <template #labels>
            <p>
              The entire layout will use star seeds
            </p>
          </template>
        </OptionCard>

        <OptionCard label="goldAverageSetting" name="Process Gold Average Method">
          <template #input>
            <div class="join">
              <button class="join-item btn text-accent"
                :class="{ 'bg-palia-blue': (processor.settings.goldAverageSetting === 'crafterTime') }"
                @click="processor.settings.goldAverageSetting = 'crafterTime'">
                Crafter Time
              </button>
              <button class="join-item btn text-accent"
                :class="{ 'bg-palia-blue': (processor.settings.goldAverageSetting === 'growthTick') }"
                @click="processor.settings.goldAverageSetting = 'growthTick'">
                Growth Ticks
              </button>
            </div>
          </template>
          <template #labels>
            <p>
              When processing crops, the gold average will be calculated by:
            </p>
            <p>
              <span class="font-bold">Crafting Time:</span> Gold / Overall Process Time
            </p>
            <p>
              <span class="font-bold">Growth Ticks:</span> Gold / Growth Ticks (Day of Last Harvest)
            </p>
          </template>
        </OptionCard>


        <OptionCard label="includeReplant" name="Include Replant">
          <template #input>
            <input v-model="harvester.settings.includeReplant" class="toggle" type="checkbox"
              aria-label="Include Replant">
          </template>
          <template #labels>
            <p>
              Replants the crops after harvest until the last day
            </p>
            <p v-show="!harvester.settings.includeReplant" class="font-bold">
              Off: Bonuses will still be calculated but the
              harvest days will be inaccurate
            </p>
          </template>
        </OptionCard>

        <OptionCard label="includeReplantCost" name="Include Replant Cost">
          <template #input>
            <input v-model="harvester.settings.includeReplantCost" class="toggle" type="checkbox"
              :disabled="!harvester.settings.includeReplant" aria-label="Include Replant Cost">
          </template>
          <template #labels>
            <p>
              Accounts for the cost of re-planting
            </p>
          </template>
        </OptionCard>

        <OptionCard label="useGrowthBoost" name="Use Growth Boost">
          <template #input>
            <input v-model="harvester.settings.useGrowthBoost" class="toggle" type="checkbox"
              aria-label="Use Growth Boost">
          </template>
          <template #labels>
            <p>
              Factors in growth boost when simulating yields, does not account for any RNG and is theoretical
            </p>
            <p class="py-1 text-warning">
              <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
              Likely bugged as of 0.169
              <NuxtLink class="pl-1 underline text-misc"
                to="https://docs.google.com/document/d/1f4MQHjEC1RCNpDUz1I3eg2tioD_6yBmW0XWsVxUOJ1Y/edit"
                target="_blank" :prefetch="false">
                <font-awesome-icon class="text-sm" :icon="['fas', 'arrow-up-right-from-square']" />
                (Source)
              </NuxtLink>
            </p>
          </template>
        </OptionCard>

        <OptionCard label="includeFertiliserCosts" name="Include Fertiliser Costs" disabled>
          <template #input>
            <input class="toggle" type="checkbox" disabled aria-label="Include Fertiliser Costs (Not yet supported)">
          </template>
          <template #labels>
            <p>
              <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
              Not yet supported
            </p>
          </template>
        </OptionCard>
      </ul>
    </section>
    <section v-else-if="activeTab === 'Crops'" class="h-full rounded-md isolate bg-accent dark:bg-palia-blue-dark">
      <div v-if="activeProcessorSettings.cropSettings.size > 0" aria-hidden
        class="absolute bottom-0 z-10 w-full rounded-md pointer-events-none opacity-70 h-1/4 max-h-12 bg-linear-to-b from-transparent to-primary dark:to-palia-blue-secondary" />

      <div v-if="activeProcessorSettings.cropSettings.size > 0"
        class="z-10 grid items-center grid-cols-12 gap-2 px-3 py-2 pt-3 border-b text-misc dark:text-primary rounded-t-md dark:border-b-water-retain/60">
        <div class="relative flex items-center w-full col-span-2 gap-2 md:col-span-1 xl:col-span-2">
          <p class="text-sm font-bold">
            Item
          </p>
        </div>
        <div class="flex items-center justify-start w-full h-full col-span-5 md:col-span-6 xl:col-span-5">
          <p class="text-sm font-bold">
            Process As
          </p>
        </div>
        <div class="flex items-center justify-start w-full h-full col-span-5 gap-2 pl-2"
          :class="{ 'text-warning': isOverCrafterLimit }">
          <p class="text-sm font-bold" :class="{ tooltip: isOverCrafterLimit }"
            data-tip="Known max of 30 crafters reached">
            <span v-if="isOverCrafterLimit">
              <FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" />
            </span>
            Crafters{{ (activeCrafterCount > 0) ? `: ${activeCrafterCount}` : '' }}
          </p>
        </div>
      </div>
      <section
        class="overflow-y-auto max-h-[436px] rounded-b-md scrollbar scrollbar-w-1 scrollbar-thumb-rounded-xl scrollbar-thumb-palia-blue dark:scrollbar-thumb-accent">
        <div v-if="activeProcessorSettings.cropSettings.size === 0"
          class="flex items-center justify-center p-2 py-4 font-bold rounded-md text-misc bg-accent dark:bg-palia-blue-secondary dark:text-accent">
          <p>
            No crops in garden, add some to begin processing.
          </p>
        </div>
        <ul v-if="activeProcessorSettings.cropSettings.size > 0"
          class="flex flex-col max-h-full gap-1 pb-8 pl-1 pr-2 rounded-b-md bg-accent dark:bg-palia-blue">
          <li v-for="[cropId, setting] in activeProcessorSettings.cropSettings" :key="cropId"
            class="grid items-start grid-cols-12 gap-2 py-1.5 pb-2.5 overflow-hidden  text-misc dark:text-accent not-last:border-b dark:not-last:border-b-water-retain/60">
            <div class="flex items-center w-full col-span-2 gap-2 md:col-span-1 xl:col-span-2">
              <ItemDisplayAlt :img-src="getCropImgSrc(setting.cropType).src"
                :img-alt="getCropImgSrc(setting.cropType).alt" :star="setting.isStar" :count="setting.count" />
              <p class="hidden font-bold capitalize xl:text-xs xl:block">
                {{ setting.cropType }}
              </p>
            </div>
            <div class="flex flex-col items-start justify-start w-full h-full col-span-5 md:col-span-6 xl:col-span-5">
              <div class="join">
                <button class="p-2 btn join-item btn-primary btn-square dark:bg-palia-blue dark:border-water-retain/60"
                  :class="(setting.processAs === ItemType.Crop) ? 'btn-active dark:bg-palia-blue-dark/40' : ''" @click="async () => {
                    if (setting.processAs === ItemType.Crop)
                      return

                    setting.processAs = ItemType.Crop

                    await nextTick()
                    onChangeSettings()
                  }" aria-label="Process as Crop">
                  <img class="w-full h-full" :src="getCropFromType(setting.cropType)?.cropImage"
                    :alt="`${setting.cropType} Crop`">
                </button>
                <button class="p-2 btn join-item btn-primary btn-square dark:bg-palia-blue dark:border-water-retain/60"
                  :class="(setting.processAs === ItemType.Seed) ? 'btn-active dark:bg-palia-blue-dark/40' : ''" @click="() => {
                    if (setting.processAs === ItemType.Seed)
                      return

                    setting.processAs = ItemType.Seed

                    onChangeSettings()
                  }" aria-label="Process as Seed">
                  <img class="w-full h-full" :src="getCropFromType(setting.cropType)?.seedImage"
                    :alt="`${setting.cropType} Seed`">
                </button>
                <button v-if="getCropFromType(setting.cropType)?.goldValues.hasPreserve"
                  class="p-2 btn join-item btn-primary btn-square dark:bg-palia-blue dark:border-water-retain/60"
                  :class="(setting.processAs === ItemType.Preserve) ? 'btn-active dark:bg-palia-blue-dark/40' : ''"
                  @click="() => {
                    if (setting.processAs === ItemType.Preserve)
                      return
                    setting.processAs = ItemType.Preserve
                    onChangeSettings()
                  }" aria-label="Process as Preserve">
                  <img class="h-full" :src="getCropFromType(setting.cropType)?.preserveImage"
                    :alt="`${setting.cropType} Preserve`">
                </button>
              </div>
              <p v-if="(setting.processAs === ItemType.Preserve && isUnderleveledForPreserveJar)
                || (setting.processAs === ItemType.Seed && isUnderleveledForSeeder)"
                class="text-xxs pl-1 flex items-center gap-0.5 text-warning font-bold">
                <FontAwesomeIcon :icon="['fas', 'triangle-exclamation']" />
                Need level
                <template v-if="setting.processAs === ItemType.Preserve">8+</template>
                <template v-else>5+</template>
              </p>
            </div>

            <div v-if="setting.processAs !== ItemType.Crop"
              class="relative flex flex-col items-start justify-start w-full h-full col-span-5 gap-x-2 pl-2">
              <div class="join">
                <button
                  class="btn btn-sm  join-item disabled:bg-palia-blue-dark! dark:bg-water-retain dark:text-palia-blue dark:disabled:bg-palia-blue-light!"
                  :disabled="setting.crafters <= 1" @click="() => {
                    if (setting.crafters <= 1)
                      return

                    setting.crafters--

                    onChangeSettings()
                  }" aria-label="Remove 1 Crafter">
                  <font-awesome-icon :icon="['fas', 'chevron-left']" />
                </button>
                <input v-model="setting.crafters" class="input input-sm text-center w-12 text-white! join-item"
                  type="number" min="1" @change="() => {
                    if (setting.crafters < 1)
                      setting.crafters = 1

                    onChangeSettings()
                  }">
                <button
                  class="btn-square btn btn-sm join-item disabled:bg-palia-blue-dark! dark:bg-water-retain dark:text-palia-blue dark:disabled:bg-palia-blue-light!"
                  @click="() => {
                    setting.crafters++

                    onChangeSettings()
                  }" aria-label="Add 1 Crafter">
                  <font-awesome-icon :icon="['fas', 'chevron-right']" />
                </button>
              </div>
              <p class="absolute bottom-0 w-full translate-y-2.5 whitespace-nowrap">
                <SettingsMinutesDisplay class="whitespace-nowrap dark:text-accent"
                  :minutes="processor.processor.output[setting.processAs === ItemType.Seed ? 'seeds' : 'preserves'].get(cropId)?.minutesProcessedEffective" />
                <span
                  v-if="processor.processor.output[setting.processAs === ItemType.Seed ? 'seeds' : 'preserves'].get(cropId)?.minutesProcessedEffective === highestTime"
                  class="inline-grid *:[grid-area:1/1] pl-1">
                  <span class="status status-info animate-ping"></span>
                  <span class="status status-info"></span>
                </span>
              </p>
            </div>
          </li>
        </ul>
      </section>
    </section>
    <SettingsCodeSettings v-else-if="activeTab === 'Misc'"></SettingsCodeSettings>
  </section>
</template>
