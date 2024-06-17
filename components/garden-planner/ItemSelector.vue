<script setup lang="ts">
import HoveredItemTooltip from './HoveredItemTooltip.vue'
import useGarden from '~/stores/useGarden'
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import type { SelectedItem } from '~/stores/useSelectedItem'
import { SelectedItemType, useSelectedItem } from '~/stores/useSelectedItem'
import type { Crop, Fertiliser, PlotStat } from '~/assets/scripts/garden-planner/imports'
import { Bonus, CropType, FertiliserType, crops, fertilisers } from '~/assets/scripts/garden-planner/imports'

const selectedItem = useSelectedItem()
const isTakingScreenshot = useTakingScreenshot()
const { plotStat } = useGarden() as { plotStat: PlotStat }
const totalFertilisers = computed(() => {
  let count = 0
  for (const fertiliser in plotStat.fertiliserCount)
    count += plotStat.fertiliserCount[fertiliser as FertiliserType]
  return count
})

const hoveredItem = ref<SelectedItem | null>(null)

const bonusToSortBy = ref<Bonus | null>(null)

const cropsList = computed(() => {
  const list: { crop: Crop; count: number }[] = []
  for (const crop of Object.values(crops))
    list.push({ crop, count: plotStat.cropTypeCount[crop.type] })

  let sortedList = list
  if (bonusToSortBy.value)
    sortedList = list.filter(crop => crop.crop.cropBonus === bonusToSortBy.value)

  // else sort by bonus type
  else
    sortedList = list.sort((a, b) => compareBonus(a.crop.cropBonus, b.crop.cropBonus))

  return sortedList
})

const bonusRanking = [
  Bonus.WaterRetain,
  Bonus.HarvestIncrease,
  Bonus.WeedPrevention,
  Bonus.QualityIncrease,
  Bonus.SpeedIncrease,
]

// manual override for sorting by bonus type, we'll sort by water retain -> harvest increase -> weed prevention -> quality increase
function compareBonus(a: Bonus, b: Bonus) {
  return bonusRanking.indexOf(a) - bonusRanking.indexOf(b)
}

const cropsListRef = ref<HTMLDivElement | null>(null)

const { x: cropsListScrollX } = useScroll(cropsListRef)

const { pause: pauseLeft, resume: resumeLeft } = useIntervalFn(() => {
  cropsListScrollX.value -= 4
}, 10, {
  immediate: false,
})

const { pause: pauseRight, resume: resumeRight } = useIntervalFn(() => {
  cropsListScrollX.value += 4
}, 10, {
  immediate: false,
})
</script>

<template>
  <div class="relative flex flex-col py-2 bg-accent">
    <div class="relative grid px-2 lg:grid-cols-7 ">
      <section
        v-if="!(isTakingScreenshot.get && plotStat.cropCount <= 0)"
        class="flex flex-col order-1 w-full lg:col-span-4"
        :class="[isTakingScreenshot.get ? 'col-span-4' : '']"
      >
        <div class="flex gap-2">
          <h3 class="font-semibold text-palia-blue">
            Crops
          </h3>
          <ul class="flex items-center gap-2 text-sm">
            <li
              :class="`flex items-center justify-center w-6 p-1 rounded-sm border hover:bg-palia-blue border-palia-dark-blue border-solid aspect-square cursor-pointer
              ${bonusToSortBy === null ? 'bg-palia-blue text-accent' : 'hover:bg-opacity-10 text-palia-dark-blue'}`"
              @click="bonusToSortBy = null"
            >
              <font-awesome-icon class="" :icon="['fas', 'list']" />
            </li>
            <li
              :class="`flex items-center justify-center w-6 p-1 rounded-sm border hover:bg-palia-blue border-palia-dark-blue border-solid aspect-square cursor-pointer
              ${bonusToSortBy === Bonus.WaterRetain ? 'bg-palia-blue' : 'hover:bg-opacity-10'}`"
              @click="bonusToSortBy = Bonus.WaterRetain"
            >
              <font-awesome-icon class="text-water-retain" :icon="['fas', 'droplet']" />
            </li>
            <li
              :class="`flex items-center justify-center w-6 p-1 rounded-sm border hover:bg-palia-blue border-palia-dark-blue border-solid aspect-square cursor-pointer
              ${bonusToSortBy === Bonus.HarvestIncrease ? 'bg-palia-blue' : 'hover:bg-opacity-10'}`"
              @click="bonusToSortBy = Bonus.HarvestIncrease"
            >
              <font-awesome-icon class="text-harvest-boost-dark" :icon="['fas', 'wheat-awn']" />
            </li>
            <li
              :class="`flex items-center justify-center w-6 p-1 rounded-sm border hover:bg-palia-blue border-palia-dark-blue border-solid aspect-square cursor-pointer
              ${bonusToSortBy === Bonus.QualityIncrease ? 'bg-palia-blue' : 'hover:bg-opacity-10'}`"
              @click="bonusToSortBy = Bonus.QualityIncrease"
            >
              <font-awesome-icon class="text-quality-increase-dark" :icon="['fas', 'star']" />
            </li>
            <li
              :class="`flex items-center justify-center w-6 p-1 rounded-sm border hover:bg-palia-blue border-palia-dark-blue border-solid aspect-square cursor-pointer
              ${bonusToSortBy === Bonus.WeedPrevention ? 'bg-palia-blue' : 'hover:bg-opacity-10'}`"
              @click="bonusToSortBy = Bonus.WeedPrevention"
            >
              <font-awesome-icon class="text-weed-prevention" :icon="['fas', 'shield']" />
            </li>
            <li
              :class="`flex items-center justify-center w-6 p-1 rounded-sm border hover:bg-palia-blue border-palia-dark-blue border-solid aspect-square cursor-pointer
              ${bonusToSortBy === Bonus.SpeedIncrease ? 'bg-palia-blue' : 'hover:bg-opacity-10'}`"
              @click="bonusToSortBy = Bonus.SpeedIncrease"
            >
              <font-awesome-icon class="text-growth-boost" :icon="['fas', 'forward-fast']" />
            </li>
          </ul>
        </div>
        <div class="flex gap-1 p-1 rounded-md w-fit">
          <div class="hidden pb-1 sm:flex lg:items-center">
            <button
              id="crop-eraser" aria-label="Select Crop Eraser"
              class="relative border rounded-sm btn btn-square btn-secondary isolate border-misc"
              :class="(selectedItem.val === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
              :in-picture-mode="isTakingScreenshot.get" @click="selectedItem.select('crop-erase')"
              @mouseover="hoveredItem = SelectedItemType.CropErase"
              @mouseleave="hoveredItem = null"
            >
              <font-awesome-icon class="absolute -z-10 max-w-[45px] text-success text-2xl " :icon="['fas', 'eraser']" />
            </button>
          </div>
          <div class="flex">
            <button
              aria-label="Scroll Left" class="hidden px-2 rounded-r-none btn btn-primary w-fit sm:block"
              @mousedown="resumeLeft" @mouseup="pauseLeft" @mouseleave="pauseLeft"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <div
              ref="cropsListRef"
              class="flex flex-wrap items-center justify-start w-full gap-1 pb-1 sm:max-w-lg md:max-w-xl lg:max-w-2xl sm:overflow-x-auto sm:flex-nowrap sm:scrollbar-primary-horizontal"
            >
              <button
                id="crop-eraser" aria-label="Select Crop Eraser"
                class="relative border rounded-sm btn btn-square btn-secondary isolate border-misc sm:hidden"
                :class="(selectedItem.val === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
                :in-picture-mode="isTakingScreenshot.get" @click="selectedItem.select('crop-erase')"
                @mouseover="hoveredItem = SelectedItemType.CropErase"
                @mouseleave="hoveredItem = null"
              >
                <font-awesome-icon class="absolute -z-10 max-w-[45px] text-success text-2xl " :icon="['fas', 'eraser']" />
              </button>
              <template v-for="(listedCrop) in cropsList" :key="listedCrop.crop.type">
                <CropButton
                  v-if="(listedCrop.crop.type !== CropType.None as CropType)"
                  :crop="listedCrop.crop"
                  :is-selected="(selectedItem.type === SelectedItemType.Crop)
                    && selectedItem.val !== null
                    && listedCrop.crop.type === (selectedItem.val as Crop).type"
                  :count="listedCrop.count" @click="selectedItem.select(crops[listedCrop.crop.type])"
                  @mouseover="hoveredItem = listedCrop.crop"
                  @mouseleave="hoveredItem = null"
                />
              </template>
            </div>
            <button
              aria-label="Scroll Left" class="hidden px-2 rounded-l-none btn btn-primary w-fit sm:block"
              @mousedown="resumeRight" @mouseup="pauseRight" @mouseleave="pauseRight"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>
      </section>
      <section
        class="flex flex-wrap order-2 lg:justify-end lg:col-span-3"
        :class="[isTakingScreenshot.get ? 'col-span-3' : '']"
      >
        <div v-if="!(isTakingScreenshot.get && totalFertilisers <= 0)">
          <h3 class="font-semibold text-palia-blue">
            Fertilisers per Day
          </h3>
          <div class="flex flex-wrap gap-1 pt-2">
            <button
              id="fertiliser-eraser" aria-label="Select Fertiliser Eraser"
              class="relative border rounded-sm btn btn-square btn-secondary isolate border-misc"
              :class="(selectedItem.val === 'fertiliser-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
              @click="selectedItem.select('fertiliser-erase')"
              @mouseover="hoveredItem = SelectedItemType.FertiliserErase"
              @mouseleave="hoveredItem = null"
            >
              <font-awesome-icon class="absolute -z-10 max-w-[42px] text-warning text-2xl " :icon="['fas', 'eraser']" />
            </button>
            <template v-for="(count, index) in plotStat.fertiliserCount" :key="index">
              <FertiliserButton
                v-if="index !== FertiliserType.None" :fertiliser="fertilisers[index] as Fertiliser"
                :is-selected="(selectedItem.type === SelectedItemType.Fertiliser)
                  && selectedItem.val !== null
                  && index === (selectedItem.val as Fertiliser).type"
                :count="count" @click="selectedItem.select(fertilisers[index])"
                @mouseover="hoveredItem = fertilisers[index]"
                @mouseleave="hoveredItem = null"
              />
            </template>
          </div>
        </div>
      </section>
    </div>
    <div class="px-2 text-xs pb -1">
      <HoveredItemTooltip :hovered-item="(hoveredItem || selectedItem.val) as SelectedItem" />
    </div>
  </div>
</template>
