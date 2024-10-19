<script setup lang="ts">
import ItemDisplayAlt from './HarvestCalculator/ItemDisplayAlt.vue'
import OptionCard from './HarvestCalculator/OptionCard.vue'
import SettingsMinutesDisplay from './SettingsMinutesDisplay.vue'
import useHarvester from '~/stores/useHarvester'
import type { ProcessorSetting, ProcessorSettings } from '~/assets/scripts/garden-planner/classes/processor'
import { type ICropName, ItemType } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import { CropType, getCropFromType } from '~/assets/scripts/garden-planner/imports'
import useProcessor from '~/stores/useProcessor'
import type { IHarvesterOptions } from '~/assets/scripts/garden-planner/classes/harvester'

const harvester = useHarvester()

const harvesterSettings = ref({
  days: -1 as number | 'L' | 'M',
  includeReplant: true as boolean,
  includeReplantCost: true as boolean,
  level: 25 as number,
  useGrowthBoost: false as boolean,
  useStarSeeds: true as boolean,
} satisfies IHarvesterOptions)

const starBaseChance = ref(0.25 + (harvesterSettings.value.useStarSeeds ? 0.25 : 0) + (harvesterSettings.value.level * 0.02))

watchEffect(() => {
  if (harvesterSettings.value.level < 0)
    harvesterSettings.value.level = 0

  starBaseChance.value = 0.25 + (harvesterSettings.value.useStarSeeds ? 0.25 : 0) + (harvesterSettings.value.level * 0.02)

  starBaseChance.value = Math.min(1, starBaseChance.value)

  if (harvesterSettings.value.days === 'L')
    harvesterSettings.value.days = -1
  else if (harvesterSettings.value.days === 'M')
    harvesterSettings.value.days = 0

  if (harvesterSettings.value.days < -1)
    harvesterSettings.value.days = -1

  harvester.updateSettings({ ...harvesterSettings.value })
})

const processor = useProcessor()
const processorSettings = ref({
  cropSettings: new Map() as Map<ICropName, ProcessorSetting>,
  crafterSetting: 0,
} satisfies ProcessorSettings)

watchEffect(() => {
  // set all isActive to false
  for (const setting of processorSettings.value.cropSettings.values())
    setting.isActive = false

  for (const [cropId, data] of harvester.totalHarvest.crops) {
    const cropSetting = processorSettings.value.cropSettings.get(cropId) ?? {
      cropType: data.cropType,
      isStar: data.isStar,
      processAs: ItemType.Crop,
      crafters: 1,
      targetTime: 0,
      isActive: true,
    }

    processorSettings.value = {
      ...processorSettings.value,
      cropSettings: new Map(processorSettings.value.cropSettings).set(cropId, cropSetting),
    }

    processorSettings.value.cropSettings.get(cropId)!.isActive = true
  }
})

// Allows us to save settings of unselected crops
const activeProcessorSettings = computed(() => {
  const activeSettings = {
    cropSettings: new Map() as Map<ICropName, ProcessorSetting>,
    crafterSetting: 0,
  } satisfies ProcessorSettings

  for (const [cropId, setting] of processorSettings.value.cropSettings) {
    if (setting.isActive)
      activeSettings.cropSettings.set(cropId, setting)
  }

  return activeSettings
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
  processor.updateSettings(Object.assign({}, processorSettings.value))
  processor.simulateProcessing(harvester.totalHarvest)
}

function onChangeSettings() {
  updateSettings()
}

function minutesToHoursAndMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return {
    hours,
    minutes: remainingMinutes,
  }
}
</script>

<template>
  <section id="planner-settings" class="relative flex flex-col gap-1 py-2 ">
    <ul class="font-bold tabs tabs-boxed w-fit bg-misc-dark join">
      <li
        class="tab join-item"
        :class="(activeTab === 'Harvest') ? 'tab-active' : ''"
        @click="activeTab = 'Harvest'"
      >
        <p>Harvest</p>
      </li>
      <li
        class="tab join-item"
        :class="(activeTab === 'Crops') ? 'tab-active' : ''"
        @click="activeTab = 'Crops'"
      >
        <p>Crops</p>
      </li>
    </ul>
    <section
      v-if="activeTab === 'Crops'"
      class="h-full rounded-md isolate bg-accent"
    >
      <div
        v-if="activeProcessorSettings.cropSettings.size > 0"
        aria-hidden
        class="absolute bottom-0 z-10 w-full rounded-md pointer-events-none opacity-70 h-1/4 max-h-12 bg-gradient-to-b from-transparent to-primary"
      />

      <div
        v-if="activeProcessorSettings.cropSettings.size > 0"
        class="z-10 grid items-center grid-cols-10 gap-2 px-1 py-2 border-b text-misc bg-accent rounded-t-md"
      >
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
        <div
          class="flex items-center justify-start w-full h-full col-span-3 gap-2 pl-2"
        >
          <p class="text-sm font-bold">
            Crafters
          </p>
        </div>
      </div>
      <section class="overflow-y-auto max-h-[456px] rounded-b-md pb-2 scrollbar-primary">
        <div
          v-if="activeProcessorSettings.cropSettings.size === 0"
          class="flex items-center justify-center p-2 py-4 font-bold rounded-md text-misc bg-accent"
        >
          <p>
            No crops in garden, add some to begin processing.
          </p>
        </div>
        <ul
          v-if="activeProcessorSettings.cropSettings.size > 0"
          class="flex flex-col max-h-full gap-1 pb-8 pl-1 pr-2 rounded-b-md bg-accent"
        >
          <li
            v-for="[cropId, setting] in activeProcessorSettings.cropSettings"
            :key="cropId"
            class="grid items-center grid-cols-10 gap-2 py-1 pb-3  text-misc [&:not(:last-child)]:border-b "
          >
            <div class="flex items-center w-full col-span-2 gap-2 md:col-span-1 xl:col-span-2">
              <ItemDisplayAlt
                :img-src="getCropImgSrc(setting.cropType).src"
                :img-alt="getCropImgSrc(setting.cropType).alt"
                :star="setting.isStar"
              />
              <p class="hidden font-bold capitalize xl:text-xs 2xl:text-sm xl:block">
                {{ setting.cropType }}
              </p>
            </div>
            <div class="flex items-center justify-start w-full h-full col-span-5 md:col-span-6 xl:col-span-5">
              <div class="join ">
                <button
                  class="btn join-item btn-primary btn-xs md:btn-sm"
                  :class="(setting.processAs === ItemType.Crop) ? 'btn-active' : ''"
                  @click="async () => {
                    if (setting.processAs === ItemType.Crop)
                      return

                    setting.processAs = ItemType.Crop

                    await nextTick()
                    onChangeSettings()
                  }"
                >
                  Crop
                </button>
                <button
                  class="btn join-item btn-primary btn-xs md:btn-sm"
                  :class="(setting.processAs === ItemType.Seed) ? 'btn-active' : ''"
                  @click="() => {
                    if (setting.processAs === ItemType.Seed)
                      return

                    setting.processAs = ItemType.Seed

                    onChangeSettings()
                  }"
                >
                  Seed
                </button>
                <button
                  class="btn join-item btn-primary btn-xs md:btn-sm"
                  :class="(setting.processAs === ItemType.Preserve) ? 'btn-active' : ''"
                  @click="() => {
                    if (setting.processAs === ItemType.Preserve)
                      return

                    setting.processAs = ItemType.Preserve

                    onChangeSettings()
                  }"
                >
                  Preserve
                </button>
              </div>
            </div>

            <div
              v-if="setting.processAs !== ItemType.Crop"
              class="relative flex flex-col items-start justify-start w-full h-full col-span-3 gap-2 pl-2"
            >
              <div class="join">
                <button
                  class="btn btn-square btn-primary btn-xs lg:btn-sm join-item"
                  :disabled="setting.crafters <= 1"
                  @click="() => {
                    if (setting.crafters <= 1)
                      return

                    setting.crafters--

                    onChangeSettings()
                  }"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-left']" />
                </button>
                <input
                  v-model="setting.crafters" class="w-8 text-sm text-center bg-accent text-misc"
                  join-item
                  type="number"
                  min="1"
                  @change="() => {
                    if (setting.crafters < 1)
                      setting.crafters = 1

                    onChangeSettings()
                  }"
                >
                <button
                  class="btn btn-square btn-primary btn-xs lg:btn-sm join-item"
                  @click="() => {
                    setting.crafters++

                    onChangeSettings()
                  }"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-right']" />
                </button>
              </div>
              <SettingsMinutesDisplay
                class="absolute bottom-0 translate-y-2"
                :minutes="processor.output[setting.processAs === ItemType.Seed ? 'seeds' : 'preserves'].get(cropId)?.minutesProcessedFinal "
              />
            </div>
          </li>
        </ul>
      </section>
    </section>
    <section
      v-else-if="activeTab === 'Harvest'"
      class="relative h-full isolate"
    >
      <div
        v-if="activeProcessorSettings.cropSettings.size > 0"
        aria-hidden
        class="absolute bottom-0 z-10 w-full rounded-md pointer-events-none opacity-90 h-1/4 max-h-12 bg-gradient-to-b from-transparent to-primary"
      />
      <ul class="grid gap-1 max-h-[488px] overflow-y-auto pr-2 rounded-md scrollbar-primary">
        <OptionCard label="days" name="Days">
          <template #input>
            <div class="join">
              <button class="join-item btn btn-sm " @click="harvesterSettings.days = -1">
                LCM
              </button>
              <button class="join-item btn btn-sm " @click="harvesterSettings.days = 0">
                Auto
              </button>
              <input
                v-model="harvesterSettings.days" class="join-item input input-sm text-lg max-w-[6rem] text-accent" type="number"
                min="0"
              >
              <button class="join-item btn btn-sm " @click="harvesterSettings.days = 30">
                30
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
              <button class="join-item btn btn-sm text-primary" @click="harvesterSettings.level = 0">
                0
              </button>
              <button class="join-item btn btn-sm text-primary" @click="harvesterSettings.level = 10">
                10
              </button>
              <input
                v-model="harvesterSettings.level" class="input input-sm text-lg max-w-[5rem] join-item text-accent"
                type="number" min="0"
              >
              <button class="join-item btn btn-sm text-primary" @click="harvesterSettings.level = 25">
                25
              </button>
              <button class="join-item btn btn-sm text-primary " @click="harvesterSettings.level = 50">
                50
              </button>
            </div>
          </template>
          <template #labels>
            <p>
              Decides base star chance of crops
            </p>
            <p>
              Base Star Chance: <code
                class="px-2 rounded-sm bg-misc text-accent"
              >{{ Math.trunc(Math.min(100, starBaseChance * 100)) }}%</code>
            </p>
            <p>Formula in info</p>
          </template>
        </OptionCard>

        <OptionCard label="allStarSeeds" name="All Star Seeds">
          <template #input>
            <input v-model="harvesterSettings.useStarSeeds" class="rounded-md toggle" type="checkbox">
          </template>
          <template #labels>
            <p>
              The entire layout will use star seeds
            </p>
          </template>
        </OptionCard>

        <OptionCard label="includeReplant" name="Include Replant">
          <template #input>
            <input v-model="harvesterSettings.includeReplant" class="rounded-md toggle" type="checkbox">
          </template>
          <template #labels>
            <p>
              Replants the crops after harvest until the last day
            </p>
            <p v-show="!harvesterSettings.includeReplant" class="font-bold">
              Off: Bonuses will still be calculated but the
              harvest days will be inaccurate
            </p>
          </template>
        </OptionCard>

        <OptionCard label="includeReplantCost" name="Include Replant Cost">
          <template #input>
            <input
              v-model="harvesterSettings.includeReplantCost" class="rounded-md toggle" type="checkbox"
              :disabled="!harvesterSettings.includeReplant"
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
            <input v-model="harvesterSettings.useGrowthBoost" class="rounded-md toggle" type="checkbox">
          </template>
          <template #labels>
            <p>
              Factors in growth boost when simulating yields, does not account for any RNG and is theoretical
            </p>
            <p class="py-1 text-warning">
              <font-awesome-icon class="text-sm text-warning" :icon="['fas', 'triangle-exclamation']" />
              Likely bugged as of 0.169
              <NuxtLink
                class="pl-1 underline text-misc"
                to="https://docs.google.com/document/d/1f4MQHjEC1RCNpDUz1I3eg2tioD_6yBmW0XWsVxUOJ1Y/edit"
                target="_blank"
              >
                <font-awesome-icon class="text-sm" :icon="['fas', 'arrow-up-right-from-square']" />
                (Source)
              </NuxtLink>
            </p>
          </template>
        </OptionCard>

        <OptionCard label="includeFertiliserCosts" name="Include Fertiliser Costs" disabled>
          <template #input>
            <input class="rounded-md toggle" type="checkbox" disabled>
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
  </section>
</template>
