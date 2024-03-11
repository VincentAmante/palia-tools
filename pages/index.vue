<script setup lang="ts">
import { useMousePressed, useUrlSearchParams } from '@vueuse/core'
import domtoimage from 'dom-to-image-more'

import uniqid from 'uniqid'
import download from 'downloadjs'
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
    const tile = plot.getTile(row, col)
    if (tile.fertiliser)
      plot.removeFertiliserFromTile(row, col)
    else if (tile.crop)
      plot.setTile(row, col, null)
    else
      return

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
const downloadedImgSrc = ref('')

const displayWidth = ref(0)

function setScreenshotLayout() {
  displayWidth.value = ((gardenDisplay.value?.getPlotsDisplay() as HTMLElement).clientWidth) + 200
  if (!gardenTilesAreWide.value)
    displayWidth.value += gardenDisplay.value?.getPlotsDisplay()?.clientWidth || 0

  displayWidth.value = Math.max(displayWidth.value, 1312)
  display.value.style.width = `${displayWidth.value}px`
  gardenDisplay.value?.modifyPlotsDisplayClassList((classList) => {
    classList.add(`w-${displayWidth.value}`)
  })
}

function resetScreenshotLayout() {
  display.value.style.width = ''

  gardenDisplay.value?.modifyPlotsDisplayClassList((classList) => {
    classList.remove(`w-${displayWidth.value}`)
  })
}

watch(isTakingScreenshot, () => {
  if (isTakingScreenshot.get)
    setScreenshotLayout()
  else
    resetScreenshotLayout()
})

async function saveAsImage() {
  isTakingScreenshot.set(true)
  await nextTick()
  const htmlContent = display.value as HTMLElement
  const filename = `PaliaGardenPlan-${uniqid()}.png`

  domtoimage.toPng(
    htmlContent, {
      copyDefaultStyles: false,
    },
  ).then(
    (dataUrl: string) => {
      downloadedImgSrc.value = dataUrl
      download(dataUrl, filename)
      isTakingScreenshot.set(false)
      resetScreenshotLayout()
    },
  )
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
  if (!(plot.isActive))
    return

  const tile = plot.getTile(row, col)

  if (tile?.fertiliser)
    plot.removeFertiliserFromTile(row, col)
  else if (tile?.crop)
    plot.setTile(row, col, null)
  else
    return

  garden.value.calculateBonuses()
}

function handleMiddleClick(event: MouseEvent, row: number, col: number, plot: Plot) {
  if (!(plot.isActive))
    return

  const tile = plot.getTile(row, col)

  if (tile?.crop)
    selectedItem.select(tile.crop)
  else if (tile?.fertiliser)
    selectedItem.select(tile.fertiliser)
  else
    return

  garden.value.calculateBonuses()
}

function handleMouseLeave() {
  resetHover()
  useDragAndDrop().clearTileCoords()
}
</script>

<template>
  <main class="flex flex-col gap-4 py-2">
    <h1 class="sr-only">
      Garden Planner
    </h1>
    <GuideCard />
    <LayoutCreator ref="createLayoutDialog" @create-new-layout="loadLayoutFromCode" />
    <LoadModal ref="loadModal" @load="(loadCode) => loadLayoutFromCode(loadCode)" />
    <SaveModal ref="saveModal" @save-layout="saveLayout()" />
    <ExportModal ref="exportModal" @download-image="async () => await saveAsImage()" />
    <!-- <DevOnly>
      <div class="flex flex-col gap-2 p-2 mx-12 my-2 rounded-md bg-neutral w-fit">
        <button
          class="btn btn-accent"
          @click="isTakingScreenshot.set(!isTakingScreenshot.get)"
        >
          {{ isTakingScreenshot.get }}
        </button>
        <p class="text-sm">
          Toggle Screenshot Mode
        </p>
      </div>
    </DevOnly> -->

    <div ref="display" class="lg:px-12">
      <div
        class="grid pt-2 bg-accent lg:grid-cols-7 lg:rounded-md"
        :class="[isTakingScreenshot.get ? 'grid-cols-7' : '']"
      >
        <section
          v-if="!(isTakingScreenshot.get && plotStat.cropCount <= 0)"
          class="flex flex-col order-1 w-full px-4 py-2 lg:col-span-4"
          :class="[isTakingScreenshot.get ? 'col-span-4' : '']"
        >
          <h3 class="font-semibold text-palia-blue">
            Crops
          </h3>
          <div class="flex flex-wrap w-full gap-1 pt-2">
            <button
              id="crop-eraser"
              aria-label="Select Crop Eraser"
              class="relative border rounded-sm btn btn-square btn-secondary isolate border-misc"
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
        <section
          class="flex flex-wrap order-2 px-4 py-2 lg:justify-end lg:col-span-3"
          :class="[isTakingScreenshot.get ? 'col-span-3' : '']"
        >
          <div v-if="!(isTakingScreenshot.get && fertiliserCount <= 0)">
            <h3 class="font-semibold text-palia-blue">
              Fertilisers per Day
            </h3>
            <div class="flex flex-wrap gap-1 pt-2">
              <button
                id="fertiliser-eraser"
                aria-label="Select Fertiliser Eraser"

                class="relative border rounded-sm btn btn-square btn-secondary isolate border-misc"
                :class="(selectedItem.val === 'fertiliser-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
                @click="selectedItem.select('fertiliser-erase')"
              >
                <font-awesome-icon
                  class="absolute -z-10 max-w-[42px] text-warning text-2xl "
                  :icon="['fas', 'eraser']"
                />
              </button>
              <template v-for="(count, index) in plotStat.fertiliserCount" :key="index">
                <FertiliserButton
                  v-if="index !== FertiliserType.None" :fertiliser="fertilisers[index] as Fertiliser"
                  :is-selected="(selectedItem.val instanceof Fertiliser)
                    && selectedItem.val
                      !== null
                    && index === selectedItem.val.type" :count="count"
                  @click="selectedItem.select(fertilisers[index])"
                />
              </template>
            </div>
          </div>
        </section>
        <AppDivider
          class="order-3 mx-4 my-6 mt-4 lg:col-span-7"
          :class="[isTakingScreenshot.get ? 'col-span-7' : '']"
        />
        <div
          v-if="garden.activePlotCount > 9" class="order-4 px-3 py-1 md:px-8 lg:px-12 lg:col-span-7"
          :class="[isTakingScreenshot.get ? 'col-span-7' : '']"
        >
          <p class="flex items-center gap-2 text-warning">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
            Over max plot count
          </p>
        </div>
        <section
          class="order-5 pt-0 pb-4 lg:px-3"
          :class="[
            (gardenTilesAreWide) ? 'lg:col-span-7 overflow-auto' : 'lg:col-span-3',
            (isTakingScreenshot.get && gardenTilesAreWide) ? ''
            : (isTakingScreenshot.get) ? 'col-span-3' : '',
          ]"
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
            @middle-click="handleMiddleClick"
            @mouseover="handleHover"
            @select-tile="selectTile"
            @mouseleave="handleMouseLeave"
          />
        </section>
        <HarvestCalculator
          class="w-full"
          :class="[
            (gardenTilesAreWide) ? 'order-7 lg:col-span-7' : 'order-7 lg:order-6 lg:col-span-4 xl:col-span-4',
            (isTakingScreenshot.get) ? 'col-span-4 pr-4' : '',
          ]"
          :layout="garden as Garden"
        />
        <div
          class="flex justify-center px-2 bg-primary lg:px-4 "
          :class="[
            (gardenTilesAreWide) ? 'lg:col-span-7' : 'lg:order-7 lg:col-span-3 lg:justify-start',
            (isTakingScreenshot.get) ? 'order-7 col-span-3' : 'order-6',
          ]"
        >
          <StatsDisplay
            ref="statDisplay"
            v-model:hovered-bonus="hoveredBonus"
            class="pt-2 pb-2 w-fit "
            :garden-tiles-are-wide="gardenTilesAreWide"
            :plot-stat-total="plotStat"
          />
        </div>
        <div
          v-show="isTakingScreenshot.get"
          id="watermark"
          class="flex items-start justify-end order-8 w-full px-4 lg:col-span-4 bg-primary"
          :class="[
            (gardenTilesAreWide) ? 'lg:col-span-7' : 'lg:col-span-3',
            (isTakingScreenshot.get) ? 'col-span-4' : '',
          ]"
        >
          <div class="flex flex-row-reverse items-center w-full gap-2 p-2 text-right rounded-md leading-1">
            <nuxt-img
              format="png" src="/logo.webp"
              class="max-w-[6rem]"
              alt="Palia Garden Planner Logo"
              :srcset="undefined"
              placeholder
            />
            <div class="flex flex-col items-end justify-end w-full text-right text-misc flex-nowrap ws-nowrap">
              <NuxtLink to="/" class="flex items-center justify-start gap-1">
                <p class="w-full text-2xl font-bold">
                  Palia Garden Planner
                </p>
              </NuxtLink>
              <p class="p-2 py-1 font-black rounded-md bg-accent text-misc flex-nowrap ws-nowrap w-96">
                https://palia-garden-planner.vercel.app
              </p>
            </div>
          </div>
        </div>
        <div
          class="grid order-8 gap-1 p-2 py-4 bg-primary md:gap-2"
          :class="[
            (isTakingScreenshot.get) ? 'hidden' : '',
            (gardenTilesAreWide) ? 'lg:col-span-4 px-4' : 'lg:col-span-2',
          ]"
        >
          <div class="grid items-center grid-cols-2 gap-3">
            <button
              class="h-full leading-6 btn" :class="(isTakingScreenshot.get) ? 'hidden' : ''"
              @click="openNewLayoutModal()"
            >
              New Layout
            </button>
            <button class="h-full leading-6 btn btn-error" @click="clearAllPlots()">
              <p>Clear Plot</p>
            </button>
          </div>
          <div class="grid items-center grid-cols-3 gap-3 ">
            <button
              class="h-full btn btn-accent"
              @click="() => openSaveModal()"
            >
              Save
            </button>
            <button
              class="h-full btn btn-accent"
              @click="openLoadModal()"
            >
              Load
            </button>
            <button
              class="h-full btn btn-accent"
              @click="openExportModal()"
            >
              Export
            </button>
          </div>
        </div>
        <TimeDisplay
          class="order-9 p-2 py-4 bg-primary"
          :class="[
            (isTakingScreenshot.get) ? 'hidden' : 'grid',
            (gardenTilesAreWide) ? 'lg:col-span-3' : 'lg:col-span-2',
          ]"
        />
      </div>
    </div>
  </main>
</template>
