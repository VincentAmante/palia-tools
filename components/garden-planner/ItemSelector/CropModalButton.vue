<script setup lang="ts">
import { ref } from 'vue'
import HoveredItemTooltip from './HoveredItemTooltip.vue'
import useGarden from '~/stores/useGarden'
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import type { SelectedItem } from '~/stores/useSelectedItem'
import { SelectedItemType, useSelectedItem } from '~/stores/useSelectedItem'
import type { Crop, Fertiliser } from '~/assets/scripts/garden-planner/imports'
import { Bonus, CropCode, CropType, FertiliserType, crops, fertilisers, getCropFromCode, getFertiliserFromCode } from '~/assets/scripts/garden-planner/imports'
import FertiliserCode from '~/assets/scripts/garden-planner/enums/fertilisercode'


const props = defineProps<{
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}>()

const isTakingScreenshot = useTakingScreenshot()
const selectedItem = useSelectedItem()
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

const isModalOpen = ref(false)
const modalRef = ref<HTMLDialogElement | null>(null)

function openModal() {
  modalRef.value?.showModal()
}

function closeModal() {
  modalRef.value?.close()
}


</script>

<template>
  <div
    :class="['fixed z-50 mx-4 my-4 sm:hidden', props.position === 'bottom-right' ? 'bottom-0 right-0' : '', props.position === 'bottom-left' ? 'bottom-0 left-0' : '', props.position === 'top-right' ? 'top-0 right-0' : '', props.position === 'top-left' ? 'top-0 left-0' : '']">
    <CropButton
v-if="selectedItem.type === SelectedItemType.Crop" class="shadow-xl bg-accent btn-lg"
      :crop="selectedItem.val as Crop" :count="cropsList.find(({ crop }) => (crop.type === (selectedItem.val as Crop).type))?.count"
      @click="openModal" />
    <FertiliserButton
v-else-if="selectedItem.type === SelectedItemType.Fertiliser" class="shadow-xl bg-accent btn-lg"
      :fertiliser="selectedItem.val as Fertiliser" @click="openModal" />
    <button
v-else-if="selectedItem.type === SelectedItemType.CropErase" id="crop-eraser"
      class="relative border rounded-xs shadow-xl btn btn-square btn-lg btn-secondary isolate  border-misc bg-accent dark:bg-palia-blue-secondary dark:border-water-retain/60"
      aria-label="Crop Eraser"
      :class="(selectedItem.val === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white dark:bg-palia-blue-secondary' : (isTakingScreenshot.get) ? 'hidden' : ''"
      :in-picture-mode="isTakingScreenshot.get" @click="openModal">
      <font-awesome-icon class="absolute -z-10 max-w-[45px] text-success text-2xl " :icon="['fas', 'eraser']" />
    </button>
    <button
v-else-if="selectedItem.type === SelectedItemType.FertiliserErase" id="fertiliser-eraser"
      aria-label="Fertiliser Eraser"
      class="relative border rounded-xs shadow-xl bg-accent btn btn-square btn-lg btn-secondary isolate border-misc"
      :class="(selectedItem.val === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
      :in-picture-mode="isTakingScreenshot.get" @click="openModal">
      <font-awesome-icon class="absolute -z-10 max-w-[42px] text-warning text-2xl " :icon="['fas', 'eraser']" />
    </button>
  </div>

  <dialog ref="modalRef" class="modal items-end p-2">
    <div class="modal-box h-fit">
      <form method="dialog">
        <button class="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost">
          ✕
        </button>
      </form>

      <section class="flex flex-col gap-2">
        <h2 class="text-xl font-bold">Selector</h2>
        <div>
          <h3 class="font-semibold">
            Fertilisers per Day
          </h3>
          <div class="flex flex-wrap gap-1">
            <button
id="fertiliser-eraser" aria-label="Select Fertiliser Eraser"
              class="relative border rounded-xs btn btn-lg btn-square btn-secondary isolate border-misc dark:bg-palia-blue-secondary dark:border-water-retain/60" :class="{
                'bg-white': selectedItem.val === 'fertiliser-erase' && !isTakingScreenshot.get,
                'hidden': isTakingScreenshot.get,
              }" @click="() => {
                selectedItem.select('fertiliser-erase')
              }">
              <font-awesome-icon class="absolute -z-10 max-w-[42px] text-warning text-2xl " :icon="['fas', 'eraser']" />
            </button>
            <template v-for="(count, index) in plotStat.fertiliserCount" :key="index">
              <FertiliserButton
v-if="index !== FertiliserType.None" :fertiliser="fertilisers[index] as Fertiliser"
                :is-selected="(selectedItem.type === SelectedItemType.Fertiliser)
                  && selectedItem.val !== null
                  && index === (selectedItem.val as Fertiliser).type" :count="count" @click="() => {
                    selectedItem.select(fertilisers[index])
                    closeModal()
                  }" @mouseover="hoveredItem = fertilisers[index]" @mouseleave="hoveredItem = null" />
            </template>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div>
            <h3 class="font-semibold">
              Crops
            </h3>
            <ul class="flex items-center gap-1 text-sm" :class="{ hidden: isTakingScreenshot.get }">
              <li
                class="flex items-center justify-center p-1 border border-solid rounded-xs cursor-pointer btn btn-square btn-sm border-accent aspect-square dark:border-water-retain/60"
                :class="[bonusToSortBy === null ? 'bg-accent text-misc-dark dark:bg-palia-blue-light dark:text-accent' : 'hover:bg-opacity-10 text-accent']"
                @click="bonusToSortBy = null">
                <font-awesome-icon class="" :icon="['fas', 'asterisk']" />
              </li>
              <li
                class="flex items-center justify-center p-1 border border-solid rounded-xs cursor-pointer btn btn-square btn-sm border-accent aspect-square dark:border-water-retain/60"
                :class="[bonusToSortBy === Bonus.WaterRetain ? 'bg-accent dark:bg-palia-blue-light' : 'hover:bg-opacity-10']"
                @click="bonusToSortBy = Bonus.WaterRetain">
                <font-awesome-icon class="text-water-retain" :icon="['fas', 'droplet']" />
              </li>
              <li
                class="flex items-center justify-center p-1 border border-solid rounded-xs cursor-pointer btn btn-square btn-sm border-accent aspect-square dark:border-water-retain/60"
                :class="[bonusToSortBy === Bonus.HarvestIncrease ? 'bg-accent dark:bg-palia-blue-light' : 'hover:bg-opacity-10']"
                @click="bonusToSortBy = Bonus.HarvestIncrease">
                <font-awesome-icon class="text-harvest-boost-dark" :icon="['fas', 'wheat-awn']" />
              </li>
              <li
                class="flex items-center justify-center p-1 border border-solid rounded-xs cursor-pointer btn btn-square btn-sm border-accent aspect-square dark:border-water-retain/60"
                :class="[bonusToSortBy === Bonus.QualityIncrease ? 'bg-accent dark:bg-palia-blue-light' : 'hover:bg-opacity-10']"
                @click="bonusToSortBy = Bonus.QualityIncrease">
                <font-awesome-icon class="text-quality-increase-dark" :icon="['fas', 'star']" />
              </li>
              <li
                class="flex items-center justify-center p-1 border border-solid rounded-xs cursor-pointer btn btn-square btn-sm border-accent aspect-square dark:border-water-retain/60"
                :class="[bonusToSortBy === Bonus.WeedPrevention ? 'bg-accent dark:bg-palia-blue-light' : 'hover:bg-opacity-10']"
                @click="bonusToSortBy = Bonus.WeedPrevention">
                <font-awesome-icon class="text-weed-prevention" :icon="['fas', 'shield']" />
              </li>
              <li
                class="flex items-center justify-center p-1 border border-solid rounded-xs cursor-pointer btn btn-square btn-sm border-accent aspect-square dark:border-water-retain/60"
                :class="[bonusToSortBy === Bonus.SpeedIncrease ? 'bg-accent dark:bg-palia-blue-light' : 'hover:bg-opacity-10']"
                @click="bonusToSortBy = Bonus.SpeedIncrease">
                <font-awesome-icon class="text-growth-boost" :icon="['fas', 'forward-fast']" />
              </li>
            </ul>
          </div>
          <div class="flex flex-wrap gap-1">
            <button
id="crop-eraser" aria-label="Select Crop Eraser"
              class="relative border rounded-xs btn btn-lg btn-square btn-secondary isolate border-misc sm:hidden dark:bg-palia-blue-secondary dark:border-water-retain/60"
              :class="{
                'bg-white': selectedItem.val === 'crop-erase' && !isTakingScreenshot.get,
                'hidden': isTakingScreenshot.get,
              }" :in-picture-mode="isTakingScreenshot.get" @click="() => {
                selectedItem.select('crop-erase')
                closeModal()
              }" @mouseover="hoveredItem = SelectedItemType.CropErase" @mouseleave="hoveredItem = null">
              <font-awesome-icon class="absolute -z-10 max-w-[45px] text-success text-2xl " :icon="['fas', 'eraser']" />
            </button>
            <template v-for="(listedCrop) in cropsList" :key="listedCrop.crop.type">
              <CropButton
v-if="(listedCrop.crop.type !== CropType.None as CropType)" :crop="listedCrop.crop"
                :is-selected="(selectedItem.type === SelectedItemType.Crop)
                  && selectedItem.val !== null
                  && listedCrop.crop.type === (selectedItem.val as Crop).type" :count="listedCrop.count" @click="() => {
                    selectedItem.select(crops[listedCrop.crop.type])
                    closeModal()
                  }" @mouseover="hoveredItem = listedCrop.crop" @mouseleave="hoveredItem = null" />
            </template>
          </div>
        </div>
      </section>
    </div>
    <form method="dialog" class="modal-backdrop opacity-20">
      <button>close</button>
    </form>
  </dialog>
</template>