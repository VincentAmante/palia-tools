<script setup lang="ts">
import { useMousePressed, useUrlSearchParams } from '@vueuse/core'
import domtoimage from 'dom-to-image-more'
import { computed, onMounted, ref } from 'vue'
import uniqid from 'uniqid'
import StatsDisplay from '@/components/garden-planner/StatsDisplay.vue'
import GardenDisplay from '@/components/garden-planner/GardenDisplay.vue'
import { useTakingScreenshot } from '@/stores/useIsTakingScreenshot'
import LayoutCreator from '@/components/LayoutCreator.vue'
import type { Plot, PlotStat } from '@/assets/scripts/garden-planner/imports'
import { Bonus, Crop, CropType, Fertiliser, FertiliserType, Garden, crops, fertilisers, getCropFromType } from '@/assets/scripts/garden-planner/imports'
import { useSaveCode } from '~/stores/useSaveCode'
import SaveModal from '@/components/garden-planner/SaveModal.vue'
import LoadModal from '@/components/garden-planner/LoadModal.vue'
import ExportModal from '@/components/garden-planner/ExportModal.vue'
import { useDragAndDrop } from '@/stores/useDragAndDrop'
import { useSelectedItem } from '@/stores/useSelectedItem'

useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://palia-garden-planner.vercel.app/',
    },
  ],
})

const selectedItem = useSelectedItem()
const garden = ref(new Garden())
const gardenTiles = ref(garden.value.plots)
const dragHandler = useDragAndDrop()
dragHandler.setGarden(garden.value as Garden)

function resetHover() {
  for (const row of gardenTiles.value) {
    for (const plot of row)
      plot.resetTileHover()
  }
}

function selectTile(event: MouseEvent, row: number, col: number, plot: Plot) {
  if (event.button !== 2) {
    resetHover()

    if (selectedItem.val === 'crop-erase') {
      plot.setTile(row, col, null)
    }
    else if (selectedItem.val === 'fertiliser-erase') {
      plot.removeFertiliserFromTile(row, col)
    }
    else {
      if (selectedItem.val instanceof Crop) {
        plot.setTile(row, col, selectedItem.val as Crop)
      }
      else if (selectedItem.val instanceof Fertiliser) {
        plot.addFertiliserToTile(row, col, selectedItem.val as Fertiliser, {
          removeSameId: true,
        })
      }
    }
    garden.value.calculateBonuses()
  }
}

// To dynamically react to the size of the garden, regardless of screen size
const gardenTilesAreWide = computed(() => {
  return gardenTiles.value[0].length > 3
})

// Drag click to select multiple tiles
const rightClickIsDown = ref(false)
const { pressed } = useMousePressed()

function handleHover(row: number, col: number, plot: Plot) {
  resetHover()
  plot.onTileHover(row, col, selectedItem.val as Crop | Fertiliser | null | string)

  if (pressed.value && !rightClickIsDown.value) {
    switch (selectedItem.val) {
      case 'crop-erase':
        plot.setTile(row, col, null)
        break
      case 'fertiliser-erase':
        plot.removeFertiliserFromTile(row, col)
        break
      default:
        if (selectedItem.val instanceof Crop) {
          if (plot.getTile(row, col)?.crop?.type !== selectedItem.val.type)
            plot.setTile(row, col, selectedItem.val as Crop)
        }
        else if (selectedItem.val instanceof Fertiliser) {
          plot.addFertiliserToTile(row, col, selectedItem.val as Fertiliser, {
            removeSameId: true,
          })
        }
        break
    }

    garden.value.calculateBonuses()
  }

  else if (pressed.value && rightClickIsDown.value) {
    switch (selectedItem.val) {
      case 'crop-erase':
        plot.setTile(row, col, null)
        break
      case 'fertiliser-erase':
        plot.removeFertiliserFromTile(row, col)
        break
      default:
        if (selectedItem.val instanceof Crop)
          plot.setTile(row, col, null)
        else if (selectedItem.val instanceof Fertiliser)
          plot.removeFertiliserFromTile(row, col)
        break
    }

    garden.value.calculateBonuses()
  }
}

function setCrop(type: CropType) {
  selectedItem.select(crops[type])
}

const plotStat = computed(() => ({ ...garden.value.calculateStats() } as PlotStat))
const fertiliserCount = computed(() => {
  let count = 0
  for (const fertiliser in plotStat.value.fertiliserCount)
    count += plotStat.value.fertiliserCount[fertiliser as FertiliserType]

  return count
})

function downloadURI(uri: string, name: string) {
  const link = document.createElement('a')
  link.download = name
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const saveModal = ref<InstanceType<typeof SaveModal> | null>(null)

function openSaveModal() {
  saveLayout()
  saveModal.value?.openModal()
}

const loadModal = ref<InstanceType<typeof LoadModal> | null>(null)
function openLoadModal() {
  loadModal.value?.openModal()
}

const saveCode = useSaveCode()
const loadCode = ref('')
function saveLayout() {
  saveCode.set(garden.value.saveLayout())
}
function loadLayoutFromCode(code: string) {
  garden.value.loadLayout(code)
  gardenTiles.value = garden.value.plots
  garden.value.calculateBonuses()
}

const urlParams = useUrlSearchParams('history')

function clearAllPlots() {
  garden.value.clearAllPlots()
  gardenTiles.value = garden.value.plots
  garden.value.calculateBonuses()
}

const display = ref(null as unknown as HTMLElement)
const statDisplay = ref<InstanceType<typeof StatsDisplay> | null>()
const gardenDisplay = ref<InstanceType<typeof GardenDisplay> | null>()

const exportModal = ref<InstanceType<typeof ExportModal> | null>(null)
function openExportModal() {
  exportModal.value?.openModal()
}
const isTakingScreenshot = useTakingScreenshot()
function saveAsImage() {
  isTakingScreenshot.set(true)
  let displayWidth = ((gardenDisplay.value?.getPlotsDisplay() as HTMLElement).clientWidth) + 200
  if (!gardenTilesAreWide.value)
    displayWidth += ((statDisplay.value?.getStatsDisplay() as HTMLElement).clientWidth)

  displayWidth = Math.max(displayWidth, 1440)
  display.value.style.width = `${displayWidth}px`
  gardenDisplay.value?.modifyPlotsDisplayClassList((classList) => {
    classList.add(`w-${displayWidth}`)
  })
  const htmlContent = display.value as HTMLElement

  domtoimage.toBlob(
    htmlContent, {
      copyDefaultStyles: false,
    },
  ).then((blob: Blob) => {
    const url = window.URL.createObjectURL(blob)
    downloadURI(url, `PaliaGardenPlan-${uniqid()}.png`)
    display.value.style.width = ''
    gardenDisplay.value?.modifyPlotsDisplayClassList((classList) => {
      classList.remove(`w-${displayWidth}`)
    })
    isTakingScreenshot.set(false)
  })
}

const hoveredBonus = ref(Bonus.None)
onMounted(() => {
  if (urlParams.layout) {
    loadCode.value = urlParams.layout as string
    loadLayoutFromCode(loadCode.value)
  }

  // checks if right click is down
  window.addEventListener('mousedown', (e) => {
    if (e.button === 2)
      rightClickIsDown.value = true
  })
  window.addEventListener('mouseup', (e) => {
    if (e.button === 2)
      rightClickIsDown.value = false
  })
})

const createLayoutDialog = ref<InstanceType<typeof LayoutCreator> | null>()
function openNewLayoutModal() {
  createLayoutDialog.value?.openModal()
}

function handleRightClick(event: MouseEvent, row: number, col: number, plot: Plot) {
  // event.preventDefault()
  if (selectedItem.val === 'crop-erase' || selectedItem.val instanceof Crop)
    plot.setTile(row, col, null)
  else if (selectedItem.val === 'fertiliser-erase' || selectedItem.val instanceof Fertiliser)
    plot.removeFertiliserFromTile(row, col)

  garden.value.calculateBonuses()
}

function handleMouseLeave() {
  resetHover()
  useDragAndDrop().clearTileCoords()
}
</script>

<template>
  <main class="flex flex-col py-2">
    <h1 class="sr-only">
      Garden Planner
    </h1>
    <GuideCard />
    <LayoutCreator ref="createLayoutDialog" @create-new-layout="loadLayoutFromCode" />
    <LoadModal ref="loadModal" @load="(loadCode) => loadLayoutFromCode(loadCode)" />
    <SaveModal ref="saveModal" @save-layout="saveLayout()" />
    <ExportModal ref="exportModal" @download-image="saveAsImage()" />

    <div class="flex flex-col w-full justify-center items-center">
      <section
        id="display" ref="display" class="lg:px-12 xl:px-14 py-4 font-['Merriweather'] w-full"
        :class="[(isTakingScreenshot.get) ? 'px-16' : '',
                 (isTakingScreenshot.get && gardenTilesAreWide) ? '' : 'max-w-[1680px]']"
      >
        <div class="flex flex-col bg-accent lg:rounded-lg  relative">
          <!-- <button
            class="absolute right-2 m-1 btn z-10 btn-sm px-4 btn-accent text-sm"
            @click="() => console.log('hey')"
          >
            Instructions
            <font-awesome-icon :icon="['fas', 'question-circle']" class="text-xl" />
          </button> -->
          <div class="flex flex-col xl:px-2">
            <div id="planner" class="relative py-4 pb-1">
              <section class="crop-buttons px-4 w-full flex flex-col md:flex-row gap-2">
                <h2 class="sr-only">
                  Crop Buttons
                </h2>
                <section
                  v-if="!(isTakingScreenshot.get && plotStat.cropCount <= 0)"
                  class="md:basis-2/3"
                >
                  <h3 class="font-semibold text-palia-blue">
                    Crops
                  </h3>
                  <div class="flex flex-wrap gap-2 pt-2">
                    <button
                      id="crop-eraser"
                      aria-label="Select Crop Eraser"
                      class="relative w-12 rounded-md btn-secondary border-misc border-[1px] aspect-square flex flex-col items-center justify-center isolate"
                      :class="(selectedItem.val === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
                      :in-picture-mode="isTakingScreenshot.get"
                      @click="selectedItem.select('crop-erase')"
                    >
                      <font-awesome-icon
                        class="absolute -z-10 max-w-[45px] text-success text-2xl "
                        :icon="['fas', 'eraser']"
                      />
                    </button>
                    <template v-for="(count, index) in plotStat.cropTypeCount" :key="index">
                      <CropButton
                        v-if="(index !== CropType.None)"
                        :crop="getCropFromType(index) as Crop"
                        :is-selected="(selectedItem.val instanceof Crop) && selectedItem.val !== null && index === selectedItem.val.type"
                        :count="count" @click="setCrop(index)"
                      />
                    </template>
                  </div>
                </section>
                <section class="flex flex-wrap lg:justify-end w-full md:basis-1/3">
                  <div v-if="!(isTakingScreenshot.get && fertiliserCount <= 0)">
                    <h3 class="font-semibold text-palia-blue">
                      Fertilisers per Day
                    </h3>
                    <div class="flex flex-wrap gap-2 pt-2">
                      <div v-for="(count, index) in plotStat.fertiliserCount" :key="index">
                        <div>
                          <FertiliserButton
                            v-if="index !== FertiliserType.None" :fertiliser="fertilisers[index] as Fertiliser"
                            :is-selected="(selectedItem.val instanceof Fertiliser)
                              && selectedItem.val
                                !== null
                              && index === selectedItem.val.type" :count="count"
                            @click="selectedItem.select(fertilisers[index])"
                          />
                          <button
                            v-else
                            id="fertiliser-eraser"
                            aria-label="Select Fertiliser Eraser"
                            class="relative w-12 rounded-md btn-secondary border-misc border-[1px] aspect-square flex flex-col items-center justify-center isolate"
                            :class="(selectedItem.val === 'fertiliser-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
                            @click="selectedItem.select('fertiliser-erase')"
                          >
                            <font-awesome-icon
                              class="absolute -z-10 max-w-[42px] text-warning text-2xl "
                              :icon="['fas', 'eraser']"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </section>
            </div>

            <AppDivider class="mx-4 my-6 mt-4" />

            <div
              v-if="garden.activePlotCount > 9" class="py-1 md:px-8 lg:px-12"
            >
              <p class="text-warning items-center flex gap-2">
                <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
                Over max plot count
              </p>
            </div>
            <div
              class="flex justify-between lg:pb-6 lg:px-2 "
              :class="[
                (!isTakingScreenshot.get && gardenTilesAreWide) ? 'md:gap-2 flex-col lg:mx-auto' : 'lg:flex-row md:gap-0 flex-col',
                (isTakingScreenshot.get && !gardenTilesAreWide) ? 'px-4 gap-4 !flex-row' : '',
                (isTakingScreenshot.get && gardenTilesAreWide) ? 'px-4 gap-4 ' : '',
              ]"
            >
              <section
                class=""
                :class="[
                  (isTakingScreenshot.get) ? '' : 'w-full lg:basis-3/6 xl:basis-3/6 overflow-x-auto',
                  (gardenTilesAreWide) ? 'flex flex-col items-center md:gap-2 py-2' : 'grid']"
              >
                <h2 class="sr-only">
                  Garden Display
                </h2>
                <GardenDisplay
                  ref="gardenDisplay"
                  :garden-tiles="gardenTiles as Plot[][]"
                  :garden-tiles-are-wide="gardenTilesAreWide"
                  :hovered-bonus="hoveredBonus as Bonus"
                  class="opacity-100"
                  draggable="false"
                  @right-click="handleRightClick"
                  @mouseover="handleHover"
                  @select-tile="selectTile"
                  @mouseleave="handleMouseLeave"
                />
              </section>
              <div
                class="w-full  flex flex-col lg:flex-row lg:justify-end lg:basis-3/6 xl:basis-2/3"
                :class="(gardenTilesAreWide) ? 'flex flex-col items-center lg:gap-2' : 'pt-4 lg:pt-0' "
              >
                <StatsDisplay
                  ref="statDisplay"
                  v-model:hovered-bonus="hoveredBonus"
                  class="bg-primary py-2 pt-4 h-fit lg:mt-0 lg:hidden w-full"
                  :class="[(isTakingScreenshot.get) ? 'hidden' : 'flex']"
                  :garden-tiles-are-wide="gardenTilesAreWide"
                  :plot-stat-total="plotStat"
                />
                <HarvestCalculator
                  class="w-full"
                  :layout="garden as Garden"
                />
              </div>
            </div>
          </div>
          <div
            class="w-full bg-primary rounded-b-lg py-3 grid px-0 md:px-4 lg:px-1 lg:pl-4 gap-y-6 gap-0"
            :class="(isTakingScreenshot.get) ? 'grid-cols-10 gap-6 px-1' : 'md:grid-cols-5  lg:grid-cols-12 xl:grid-cols-12 '"
          >
            <div
              class="lg:flex lg:justify-start w-full "
              :class="(isTakingScreenshot.get) ? 'col-span-5 justify-start' : 'hidden justify-center md:col-span-5 xl:col-span-5 '"
            >
              <StatsDisplay
                ref="statDisplay"
                v-model:hovered-bonus="hoveredBonus"
                class="lg:flex md:pt-0 lg:w-fit  max-w-md"
                :class="(isTakingScreenshot.get) ? 'pt-0 px-2' : 'px-1 pt-4'"
                :garden-tiles-are-wide="gardenTilesAreWide"
                :plot-stat-total="plotStat"
              />
            </div>
            <div
              v-show="isTakingScreenshot.get"
              id="watermark"
              class="col-span-5 px-4 flex justify-end items-start w-full "
            >
              <div class="flex flex-row-reverse p-2 text-right gap-2 leading-1 items-center rounded-md w-full">
                <nuxt-img
                  format="png" src="/logo.webp"
                  class="max-w-[6rem]"
                  alt="Palia Garden Planner Logo"
                  :srcset="undefined"
                  placeholder
                />
                <div class="text-right flex flex-col justify-end text-misc items-end w-full flex-nowrap ws-nowrap">
                  <NuxtLink to="/" class="flex items-center gap-1 justify-start">
                    <p class="text-2xl font-bold w-full">
                      Palia Garden Planner
                    </p>
                  </NuxtLink>
                  <p class="font-black p-2 bg-accent text-misc py-1 rounded-md flex-nowrap ws-nowrap w-96">
                    https://palia-garden-planner.vercel.app
                  </p>
                </div>
              </div>
            </div>
            <div
              class="grid gap-1 px-4 md:px-0 lg:pl-4 md:gap-2 md:col-span-3 lg:col-span-4 xl:col-span-4 "
              :class="(isTakingScreenshot.get) ? 'hidden' : ''"
            >
              <div class="grid grid-cols-2 gap-3 items-center">
                <button
                  class="btn h-full leading-6" :class="(isTakingScreenshot.get) ? 'hidden' : ''"
                  @click="openNewLayoutModal()"
                >
                  New Layout
                </button>
                <button class="btn btn-error h-full leading-6" @click="clearAllPlots()">
                  <p>Clear Plot</p>
                </button>
              </div>
              <div class="grid grid-cols-3 gap-3 items-center ">
                <button
                  class="btn h-full btn-accent"
                  @click="() => openSaveModal()"
                >
                  Save
                </button>
                <button
                  class="btn h-full btn-accent"
                  @click="openLoadModal()"
                >
                  Load
                </button>
                <button
                  class="btn h-full btn-accent"
                  @click="openExportModal()"
                >
                  Export
                </button>
              </div>
            </div>
            <TimeDisplay
              class=" md:col-span-2 lg:col-span-3 xl:col-span-3"
              :class="(isTakingScreenshot.get) ? '' : 'grid'"
            />
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
