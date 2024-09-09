<script setup lang="ts">
import HoveredItemTooltip from './HoveredItemTooltip.vue'
import useGarden from '~/stores/useGarden'
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import type { SelectedItem } from '~/stores/useSelectedItem'
import { SelectedItemType, useSelectedItem } from '~/stores/useSelectedItem'
import type { Crop, Fertiliser } from '~/assets/scripts/garden-planner/imports'
import { Bonus, CropCode, CropType, FertiliserType, crops, fertilisers, getCropFromCode, getFertiliserFromCode } from '~/assets/scripts/garden-planner/imports'
import FertiliserCode from '~/assets/scripts/garden-planner/enums/fertilisercode'

const selectedItem = useSelectedItem()
const isTakingScreenshot = useTakingScreenshot()
const gardenHandler = useGarden()

const plotStat = computed(() => gardenHandler.plotStat)
const totalFertilisers = computed(() => {
  let count = 0
  for (const fertiliser in plotStat.value.fertiliserCount)
    count += plotStat.value.fertiliserCount[fertiliser as FertiliserType]
  return count
})

const hoveredItem = ref<SelectedItem | null>(null)

const bonusToSortBy = ref<Bonus | null>(null)

const cropsList = computed(() => {
  const list: { crop: Crop; count: number }[] = []
  for (const crop of Object.values(crops))
    list.push({ crop, count: plotStat.value.cropTypeCount[crop.type] })

  let sortedList = list
  if (bonusToSortBy.value && !isTakingScreenshot.get)
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

const { x: cropsListScrollX, arrivedState } = useScroll(cropsListRef)
const { left: reachedLeft, right: reachedRight } = toRefs(arrivedState)

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

const keys = useMagicKeys()

const itemSelected = ref(false)

const lastMagicKeyPressed = ref('')

watchEffect(() => {
  // type in cropcode to select crop
  if (keys.shift.value) {
    const keysPressed = [...keys.current]

    // remove shift key
    keysPressed.shift()

    let keysAsCode = keysPressed.join('')
    keysAsCode = keysAsCode.charAt(0).toUpperCase() + keysAsCode.slice(1)

    // Prevents selecting a crop that has a similar code to another crop
    if (keysAsCode.length < lastMagicKeyPressed.value.length)
      return

    // if code is N, select crop-erase
    if (keysAsCode === 'N') {
      selectedItem.select(SelectedItemType.CropErase)
      itemSelected.value = true
      lastMagicKeyPressed.value = keysAsCode
      return
    }

    // Find crop with matching code
    for (const code of Object.values(CropCode)) {
      if (code === keysAsCode) {
        selectedItem.select(getCropFromCode(code) as Crop)
        itemSelected.value = true
        lastMagicKeyPressed.value = keysAsCode
        break
      }
    }
  }
  // Fertiliser
  else if (keys.alt.value) {
    const keysPressed = [...keys.current]

    keysPressed.shift()

    let keysAsCode = keysPressed.join('')
    keysAsCode = keysAsCode.charAt(0).toUpperCase() + keysAsCode.slice(1)

    // Prevents accidentally selecting a fertiliser that has similar code to another
    if (keysAsCode.length < lastMagicKeyPressed.value.length)
      return

    // if code is N, select fertiliser-erase
    if (keysAsCode === 'N') {
      selectedItem.select(SelectedItemType.FertiliserErase)
      itemSelected.value = true
      lastMagicKeyPressed.value = keysAsCode
      return
    }

    // Find crop with matching code
    for (const code of Object.values(FertiliserCode)) {
      if (code === keysAsCode) {
        selectedItem.select(getFertiliserFromCode(code) as Fertiliser)
        itemSelected.value = true
        lastMagicKeyPressed.value = keysAsCode
        break
      }
    }
  }

  if (keys.current.size === 0) {
    itemSelected.value = false
    lastMagicKeyPressed.value = ''
  }
})
</script>

<template>
  <section class="relative flex flex-col py-2 ">
    <div class="relative grid px-2 xl:grid-cols-7 ">
      <section
        v-if="!(isTakingScreenshot.get && plotStat.cropCount <= 0)"
        class="flex flex-col order-1 w-full xl:col-span-4"
        :class="[isTakingScreenshot.get ? 'col-span-4' : '']"
      >
        <div class="flex gap-2">
          <h3 class="font-semibold text-palia-blue">
            Crops
          </h3>
          <ul
            class="flex items-center gap-1 text-sm"
            :class="{ hidden: isTakingScreenshot.get }"
          >
            <li
              class="flex items-center justify-center w-6 p-1 border border-solid rounded-sm cursor-pointer hover:bg-palia-blue border-palia-blue-dark aspect-square"
              :class="[bonusToSortBy === null ? 'bg-palia-blue text-accent' : 'hover:bg-opacity-10 text-palia-blue-dark']"
              @click="bonusToSortBy = null"
            >
              <font-awesome-icon class="" :icon="['fas', 'asterisk']" />
            </li>
            <li
              class="flex items-center justify-center w-6 p-1 border border-solid rounded-sm cursor-pointer hover:bg-palia-blue border-palia-blue-dark aspect-square"
              :class="[bonusToSortBy === Bonus.WaterRetain ? 'bg-palia-blue' : 'hover:bg-opacity-10']"
              @click="bonusToSortBy = Bonus.WaterRetain"
            >
              <font-awesome-icon class="text-water-retain" :icon="['fas', 'droplet']" />
            </li>
            <li
              class="flex items-center justify-center w-6 p-1 border border-solid rounded-sm cursor-pointer hover:bg-palia-blue border-palia-blue-dark aspect-square"
              :class="[bonusToSortBy === Bonus.HarvestIncrease ? 'bg-palia-blue' : 'hover:bg-opacity-10']"
              @click="bonusToSortBy = Bonus.HarvestIncrease"
            >
              <font-awesome-icon class="text-harvest-boost-dark" :icon="['fas', 'wheat-awn']" />
            </li>
            <li
              class="flex items-center justify-center w-6 p-1 border border-solid rounded-sm cursor-pointer hover:bg-palia-blue border-palia-blue-dark aspect-square"
              :class="[bonusToSortBy === Bonus.QualityIncrease ? 'bg-palia-blue' : 'hover:bg-opacity-10']"
              @click="bonusToSortBy = Bonus.QualityIncrease"
            >
              <font-awesome-icon class="text-quality-increase-dark" :icon="['fas', 'star']" />
            </li>
            <li
              class="flex items-center justify-center w-6 p-1 border border-solid rounded-sm cursor-pointer hover:bg-palia-blue border-palia-blue-dark aspect-square"
              :class="[bonusToSortBy === Bonus.WeedPrevention ? 'bg-palia-blue' : 'hover:bg-opacity-10']"
              @click="bonusToSortBy = Bonus.WeedPrevention"
            >
              <font-awesome-icon class="text-weed-prevention" :icon="['fas', 'shield']" />
            </li>
            <li
              class="flex items-center justify-center w-6 p-1 border border-solid rounded-sm cursor-pointer hover:bg-palia-blue border-palia-blue-dark aspect-square"
              :class="[bonusToSortBy === Bonus.SpeedIncrease ? 'bg-palia-blue' : 'hover:bg-opacity-10']"
              @click="bonusToSortBy = Bonus.SpeedIncrease"
            >
              <font-awesome-icon class="text-growth-boost" :icon="['fas', 'forward-fast']" />
            </li>
          </ul>
        </div>
        <div class="flex gap-1 py-1 rounded-md w-fit">
          <div class="hidden pb-1 sm:flex lg:items-center">
            <button
              id="crop-eraser" aria-label="Select Crop Eraser"
              class="relative border rounded-sm btn btn-square btn-secondary isolate border-misc"
              :class="(selectedItem.val === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
              :in-picture-mode="isTakingScreenshot.get" @click="selectedItem.select('crop-erase')"
              @mouseover="hoveredItem = SelectedItemType.CropErase" @mouseleave="hoveredItem = null"
            >
              <font-awesome-icon class="absolute -z-10 max-w-[45px] text-success text-2xl " :icon="['fas', 'eraser']" />
            </button>
          </div>
          <div class="flex">
            <button
              aria-label="Scroll Items to left" class="hidden px-2 rounded-r-none btn btn-primary w-fit sm:block disabled:text-transparent"
              :class="{ '!hidden': isTakingScreenshot.get || (reachedLeft && reachedRight) }" :disabled="reachedLeft" @mousedown="resumeLeft"
              @mouseup="pauseLeft"
              @mouseleave="pauseLeft"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <div
              ref="cropsListRef"
              class="flex flex-wrap items-center justify-start w-full gap-1 pb-1 transition-all sm:max-w-lg md:max-w-xl lg:max-w-2xl sm:flex-nowrap sm:overflow-x-auto"
              :class="[(reachedLeft && reachedLeft) ? 'sm:scrollbar-invisible-horizontal' : 'sm:scrollbar-primary-horizontal']"
            >
              <!--
                :class="(selectedItem.val === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''" -->
              <button
                id="crop-eraser" aria-label="Select Crop Eraser"
                class="relative border rounded-sm btn btn-square btn-secondary isolate border-misc sm:hidden"
                :class="{
                  'bg-white': selectedItem.val === 'crop-erase' && !isTakingScreenshot.get,
                  'hidden': isTakingScreenshot.get,
                }"
                :in-picture-mode="isTakingScreenshot.get" @click="selectedItem.select('crop-erase')"
                @mouseover="hoveredItem = SelectedItemType.CropErase" @mouseleave="hoveredItem = null"
              >
                <font-awesome-icon
                  class="absolute -z-10 max-w-[45px] text-success text-2xl "
                  :icon="['fas', 'eraser']"
                />
              </button>
              <template v-for="(listedCrop) in cropsList" :key="listedCrop.crop.type">
                <CropButton
                  v-if="(listedCrop.crop.type !== CropType.None as CropType)" :crop="listedCrop.crop"
                  :is-selected="(selectedItem.type === SelectedItemType.Crop)
                    && selectedItem.val !== null
                    && listedCrop.crop.type === (selectedItem.val as Crop).type" :count="listedCrop.count"
                  @click="selectedItem.select(crops[listedCrop.crop.type])" @mouseover="hoveredItem = listedCrop.crop"
                  @mouseleave="hoveredItem = null"
                />
              </template>
            </div>
            <button
              aria-label="Scroll Right" class="hidden px-2 rounded-l-none btn btn-primary w-fit sm:block disabled:text-transparent"
              :class="{ '!hidden': isTakingScreenshot.get || (reachedLeft && reachedRight) }"
              :disabled="reachedRight"
              @mousedown="resumeRight"
              @mouseup="pauseRight"
              @mouseleave="pauseRight"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>
      </section>
      <section
        class="flex flex-wrap order-2 xl:justify-end xl:col-span-3"
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
              :class="{
                'bg-white': selectedItem.val === 'fertiliser-erase' && !isTakingScreenshot.get,
                'hidden': isTakingScreenshot.get,
              }"
              @click="selectedItem.select('fertiliser-erase')"
              @mouseover="hoveredItem = SelectedItemType.FertiliserErase" @mouseleave="hoveredItem = null"
            >
              <font-awesome-icon class="absolute -z-10 max-w-[42px] text-warning text-2xl " :icon="['fas', 'eraser']" />
            </button>
            <template v-for="(count, index) in plotStat.fertiliserCount" :key="index">
              <FertiliserButton
                v-if="index !== FertiliserType.None" :fertiliser="fertilisers[index] as Fertiliser"
                :is-selected="(selectedItem.type === SelectedItemType.Fertiliser)
                  && selectedItem.val !== null
                  && index === (selectedItem.val as Fertiliser).type" :count="count"
                @click="selectedItem.select(fertilisers[index])" @mouseover="hoveredItem = fertilisers[index]"
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
  </section>
</template>
