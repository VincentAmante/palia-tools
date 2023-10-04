<script setup lang="ts">
import { useMousePressed, useUrlSearchParams } from '@vueuse/core'
import domtoimage from 'dom-to-image-more'
import { computed, onMounted, ref } from 'vue'
import uniqid from 'uniqid'
import TimeDisplay from '@/components/TimeDisplay.vue'
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

useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://palia-garden-planner.vercel.app/',
    },
  ],
})

const selectedItem = ref<Crop | Fertiliser | null | 'crop-erase' | 'fertiliser-erase'>('crop-erase')
const garden = ref(new Garden())
const gardenTiles = ref(garden.value.plots)

function selectTile(event: MouseEvent, row: number, col: number, plot: Plot) {
  if (event.button !== 2) {
    if (selectedItem.value === 'crop-erase') {
      plot.setTile(row, col, null)
    }
    else if (selectedItem.value === 'fertiliser-erase') {
      plot.removeFertiliserFromTile(row, col)
    }
    else {
      if (selectedItem.value instanceof Crop) {
        plot.setTile(row, col, selectedItem.value as Crop)
      }
      else if (selectedItem.value instanceof Fertiliser) {
        plot.addFertiliserToTile(row, col, selectedItem.value as Fertiliser, {
          removeSameId: true,
        })
      }
    }
    garden.value.calculateBonuses()
  }
}

// To dynamically react to the size of the garden, regardless of screen size
const gardenTilesAreWide = computed(() => {
  return gardenTiles.value[0].length >= 4
})

// Drag click to select multiple tiles
const rightClickIsDown = ref(false)
const { pressed } = useMousePressed()
function handleHover(row: number, col: number, plot: Plot) {
  if (pressed.value && !rightClickIsDown.value) {
    switch (selectedItem.value) {
      case 'crop-erase':
        plot.setTile(row, col, null)
        break
      case 'fertiliser-erase':
        plot.removeFertiliserFromTile(row, col)
        break
      default:
        if (selectedItem.value instanceof Crop) {
          plot.setTile(row, col, selectedItem.value as Crop)
        }
        else if (selectedItem.value instanceof Fertiliser) {
          plot.addFertiliserToTile(row, col, selectedItem.value as Fertiliser, {
            removeSameId: true,
          })
        }
        break
    }

    garden.value.calculateBonuses()
  }

  else if (pressed.value && rightClickIsDown.value) {
    switch (selectedItem.value) {
      case 'crop-erase':
        plot.setTile(row, col, null)
        break
      case 'fertiliser-erase':
        plot.removeFertiliserFromTile(row, col)
        break
      default:
        if (selectedItem.value instanceof Crop)
          plot.setTile(row, col, null)
        else if (selectedItem.value instanceof Fertiliser)
          plot.removeFertiliserFromTile(row, col)
        break
    }

    garden.value.calculateBonuses()
  }
}

function setCrop(type: CropType) {
  selectedItem.value = crops[type]
}

const plotStatTotal = computed(() => ({ ...garden.value.calculateStats() } as PlotStat))

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

  display.value.style.width = '1680px'
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
  if (selectedItem.value === 'crop-erase' || selectedItem.value instanceof Crop)
    plot.setTile(row, col, null)
  else if (selectedItem.value === 'fertiliser-erase' || selectedItem.value instanceof Fertiliser)
    plot.removeFertiliserFromTile(row, col)

  garden.value.calculateBonuses()
}
</script>

<template>
  <main class="flex flex-col py-2">
    <GuideCard />
    <LayoutCreator ref="createLayoutDialog" @create-new-layout="loadLayoutFromCode" />
    <LoadModal ref="loadModal" @load="(loadCode) => loadLayoutFromCode(loadCode)" />
    <SaveModal ref="saveModal" @save-layout="saveLayout()" />
    <ExportModal ref="exportModal" @download-image="saveAsImage()" />
    <div class="flex flex-col w-full justify-center items-center">
      <section
        id="display" ref="display" class="lg:px-14 py-4 font-['Merriweather'] w-full max-w-[1680px]"
        :class="(isTakingScreenshot.get) ? 'px-4' : ''"
      >
        <div class="flex flex-col bg-accent lg:rounded-lg">
          <div
            id="watermark" class="px-2 md:px-0 text-left gap-2 items-start w-fit leadiing-1"
            :class="(isTakingScreenshot.get) ? 'flex' : 'hidden'"
          >
            <nuxt-img
              format="webp" src="/logo.webp" class="max-w-[3rem]"
              alt="Palia Garden Planner Logo"
            />
            <div class="text-left pb-4 flex flex-col">
              <NuxtLink to="/" class="flex items-center gap-1 justify-start">
                <p class="text-lg font-bold opacity-80 w-full">
                  Palia Garden Planner
                </p>
              </NuxtLink>
              <p class="w-full opacity-75 text-xs">
                https://palia-garden-planner.vercel.app
              </p>
            </div>
          </div>

          <div id="planner" class="relative py-4 pb-1">
            <div class="crop-buttons px-4 w-full flex flex-col md:flex-row ">
              <div class="md:basis-2/3">
                <h3 class="font-semibold text-palia-blue">
                  Crops
                </h3>
                <div class="flex flex-wrap gap-2 py-2">
                  <div v-for="(count, index) in plotStatTotal.cropTypeCount" :key="index">
                    <CropButton
                      v-if="(index && index !== CropType.None && index !== null)"
                      :crop="getCropFromType(index) as Crop"
                      :is-selected="(selectedItem instanceof Crop) && selectedItem !== null && index === selectedItem.type"
                      :count="count" @click="setCrop(index)"
                    />
                    <button
                      v-else
                      id="crop-eraser"
                      aria-label="Select Crop Eraser"
                      class="relative w-12 rounded-md btn-secondary border-misc border-[1px] aspect-square flex flex-col items-center justify-center isolate"
                      :class="(selectedItem === 'crop-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
                      :in-picture-mode="isTakingScreenshot.get"
                      @click="selectedItem = 'crop-erase'"
                    >
                      <font-awesome-icon
                        class="absolute -z-10 max-w-[45px] text-success text-3xl "
                        :icon="['fas', 'eraser']"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex flex-wrap lg:justify-end w-full md:basis-1/3">
                <div>
                  <h3 class="font-semibold text-palia-blue">
                    Fertilisers per Day
                  </h3>
                  <div class="flex flex-wrap gap-2 py-2">
                    <div v-for="(count, index) in plotStatTotal.fertiliserCount" :key="index">
                      <div>
                        <FertiliserButton
                          v-if="index !== FertiliserType.None" :fertiliser="fertilisers[index] as Fertiliser"
                          :is-selected="(selectedItem instanceof Fertiliser)
                            && selectedItem
                              !== null
                            && index === selectedItem.type" :count="count"
                          @click="selectedItem = fertilisers[index]"
                        />
                        <button
                          v-else
                          id="fertiliser-eraser"
                          aria-label="Select Fertiliser Eraser"
                          class="relative w-12 rounded-md btn-secondary border-misc border-[1px] aspect-square flex flex-col items-center justify-center isolate"
                          :class="(selectedItem === 'fertiliser-erase' && !isTakingScreenshot.get) ? 'bg-white' : (isTakingScreenshot.get) ? 'hidden' : ''"
                          @click="selectedItem = 'fertiliser-erase'"
                        >
                          <font-awesome-icon
                            class="absolute -z-10 max-w-[42px] text-warning text-3xl "
                            :icon="['fas', 'eraser']"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="garden.activePlotCount > 9" class="py-1 md:px-8 lg:px-12">
            <p class="text-warning items-center flex gap-2">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
              Over max plot count
            </p>
          </div>
          <div class="grid lg:grid-cols-2 md:gap-4 pb-4 lg:px-2" :class="(gardenTilesAreWide) ? 'md:flex-col' : ''">
            <div class="">
              <GardenDisplay
                ref="gardenDisplay"
                :garden-tiles="gardenTiles as Plot[][]"
                :garden-tiles-are-wide="gardenTilesAreWide"
                :hovered-bonus="hoveredBonus as Bonus"
                class="opacity-100"
                @right-click="handleRightClick"
                @mouseover="handleHover"
                @select-tile="selectTile"
              />
            </div>
            <StatsDisplay
              ref="statDisplay"
              v-model:hovered-bonus="hoveredBonus"
              class="md:hidden bg-primary mt-4"
              :garden-tiles-are-wide="gardenTilesAreWide"
              :plot-stat-total="plotStatTotal"
            />
            <HarvestCalculator
              class=""
              :layout="garden as Garden"
            />
          </div>

          <div class="w-full bg-primary rounded-b-lg py-4 grid md:grid-cols-10 gap-y-6 gap-x-4 lg:gap-6">
            <div class="md:col-span-5 px-1">
              <StatsDisplay
                ref="statDisplay"
                v-model:hovered-bonus="hoveredBonus"
                class="hidden md:block"
                :garden-tiles-are-wide="gardenTilesAreWide"
                :plot-stat-total="plotStatTotal"
              />
            </div>
            <div class="grid gap-3 md:gap-2 md:col-span-3 px-4">
              <div class="grid grid-cols-2 gap-3 items-center">
                <button class="btn btn-warning" @click="clearAllPlots()">
                  <p>Clear Plot</p>
                </button>
                <button
                  class="btn " :class="(isTakingScreenshot.get) ? 'hidden' : ''"
                  @click="openNewLayoutModal()"
                >
                  New Layout
                </button>
              </div>
              <div class="grid grid-cols-3 gap-3 items-center ">
                <button
                  class="btn btn-accent"
                  @click="() => openSaveModal()"
                >
                  Save
                </button>
                <button
                  class="btn btn-accent"
                  @click="openLoadModal()"
                >
                  Load
                </button>
                <button
                  class="btn btn-accent"
                  @click="openExportModal()"
                >
                  Export
                </button>
              </div>
            </div>
            <TimeDisplay />
          </div>
        </div>
      </section>
    </div>

    <div class="px-4 md:px-8 lg:px-14">
      <CreditsSection />
    </div>
  </main>
</template>
