<script setup lang="ts">
import { useClipboard, useElementBounding, useMousePressed, useUrlSearchParams } from '@vueuse/core'
import domtoimage from 'dom-to-image-more'
import { computed, onMounted, ref } from 'vue'
import uniqid from 'uniqid'
import { useTakingScreenshot } from '@/stores/useIsTakingScreenshot'
import LayoutCreator from '@/components/LayoutCreator.vue'
import type { Plot, PlotStat, Tile } from '@/assets/scripts/garden-planner/imports'
import { Bonus, Crop, CropType, Fertiliser, FertiliserType, Garden, crops, fertilisers, getCropFromType } from '@/assets/scripts/garden-planner/imports'

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
  return gardenTiles.value[0].length >= 5
})
const gardenTilesAreLong = computed(() => {
  return gardenTiles.value.length > 6
})

// Drag click to select multiple tiles
const rightClickIsDown = ref(false)
const { pressed } = useMousePressed()
function handleHover(row: number, col: number, plot: Plot) {
  if (pressed.value && !rightClickIsDown.value) {
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
  else if (pressed.value && rightClickIsDown.value) {
    if (selectedItem.value === 'crop-erase' || selectedItem.value instanceof Crop)
      plot.setTile(row, col, null)

    else if (selectedItem.value === 'fertiliser-erase' || selectedItem.value instanceof Fertiliser)
      plot.removeFertiliserFromTile(row, col)

    garden.value.calculateBonuses()
  }
}

function setCrop(type: CropType) {
  selectedItem.value = crops[type]
}

const plotStatTotal = computed(() => {
  const { cropCount, cropTypeCount, cropBonusCoverage, fertiliserCount } = garden.value.calculateStats()

  return {
    cropCount,
    cropTypeCount,
    cropBonusCoverage,
    fertiliserCount,
  } as PlotStat
})

function downloadURI(uri: string, name: string) {
  const link = document.createElement('a')
  link.download = name
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const saveCode = ref('')
const loadCode = ref('')
function saveLayoutAsCode() {
  saveCode.value = garden.value.saveLayout()
}

function loadLayoutFromCode(code: string) {
  garden.value.loadLayout(code)
  gardenTiles.value = garden.value.plots
  garden.value.calculateBonuses()
}

const urlParams = useUrlSearchParams('history')

const { copy } = useClipboard()

async function paste() {
  loadCode.value = await navigator.clipboard.readText()
}

function clearAllPlots() {
  garden.value.clearAllPlots()
  gardenTiles.value = garden.value.plots
  garden.value.calculateBonuses()
}

function clearTile(event: MouseEvent, row: number, col: number, plot: Plot) {
  if (event.button === 2) {
    plot.setTile(row, col, null)
    garden.value.calculateBonuses()
  }
}

const display = ref(null as unknown as HTMLElement)
const statDisplay = ref(null as unknown as HTMLElement)
const plotsDisplay = ref(null as unknown as HTMLElement)
const { width: plotsDisplayWidth } = useElementBounding(plotsDisplay)
const { width: statDisplayWidth } = useElementBounding(statDisplay)

const isTakingScreenshot = useTakingScreenshot()
function saveAsImage() {
  isTakingScreenshot.set(true)
  let displayWidth = plotsDisplayWidth.value + 200
  if (!gardenTilesAreWide.value)
    displayWidth += statDisplayWidth.value

  display.value.style.width = `${displayWidth}px`
  const htmlContent = display.value as HTMLElement

  domtoimage.toBlob(
    htmlContent, {
      copyDefaultStyles: false,
    },
  ).then((blob: Blob) => {
    const url = window.URL.createObjectURL(blob)
    downloadURI(url, `PaliaGardenPlan-${uniqid()}.png`)
    display.value.style.width = ''
    isTakingScreenshot.set(false)
  })
}

const saveLink = ref('')
const useMarkdown = ref(false)
function saveLayoutAsLink() {
  saveLink.value = `https://palia-garden-planner.vercel.app?layout=${garden.value.saveLayout()}`

  if (useMarkdown.value)
    saveLink.value = `[[Palia Garden Plan]](${saveLink.value})`
}

const activeTab = ref('load')
function setActiveTab(tab: string) {
  activeTab.value = tab
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
  event.preventDefault()
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
    <section
      id="display" ref="display" class="bg-base-100 flex flex-col md:px-16 py-4 font-['Roboto_Slab']"
      :class="(isTakingScreenshot.val) ? 'px-16' : ''"
    >
      <div
        id="watermark" class="px-2 md:px-0 text-left gap-2 items-start w-fit leadiing-1"
        :class="(isTakingScreenshot.val) ? 'flex' : 'hidden'"
      >
        <nuxt-img format="webp" src="/logo.webp" class="max-w-[3rem]" />
        <div class="text-left pb-4 flex flex-col">
          <NuxtLink to="/" class="flex items-center gap-1 justify-start">
            <h1 class="text-lg font-bold opacity-80 w-full">
              Palia Garden Planner
            </h1>
          </NuxtLink>
          <a class="w-full opacity-75 text-xs ">https://palia-garden-planner.vercel.app</a>
        </div>
      </div>

      <div id="planner" class="flex justify-between relative">
        <div class="crop-buttons px-4 md:px-0">
          <div class="py-2">
            <h2 class="text-xl font-bold">
              Select
            </h2>
            <p :class="(isTakingScreenshot.val) ? 'hidden' : ''">
              Pick a crop or fertiliser to place on the garden.
            </p>
            <p class="text-sm opacity-50 max-w-md" :class="(isTakingScreenshot.val) ? 'hidden' : 'hidden md:block '">
              Tip: Right clicking will remove a crop/fertiliser based on what you currently have selected.
              Drag to do it to multiple tiles at once.
            </p>
          </div>

          <div class="w-full flex flex-col">
            <div>
              <h3 class="font-semibold opacity-50 text-sm">
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
                    class="relative bg-base-200 rounded-lg md:btn-lg w-14 md:w-16 aspect-square flex flex-col items-center justify-center isolate hover:bg-slate-200"
                    :class="(selectedItem === 'crop-erase' && !isTakingScreenshot.val) ? 'bg-slate-100' : (isTakingScreenshot.val) ? 'hidden' : ''"
                    :in-picture-mode="isTakingScreenshot.val"
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

            <div>
              <h3 class="font-semibold opacity-50 text-sm">
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
                      class="relative bg-base-200 rounded-lg md:btn-lg w-14 md:w-16 aspect-square flex flex-col items-center justify-center isolate hover:bg-slate-200"
                      :class="(selectedItem === 'fertiliser-erase' && !isTakingScreenshot.val) ? 'bg-slate-100' : (isTakingScreenshot.val) ? 'hidden' : ''"
                      @click="selectedItem = 'fertiliser-erase'"
                    >
                      <font-awesome-icon
                        class="absolute -z-10 max-w-[45px] text-warning text-3xl "
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

      <div class="px-4 md:px-0">
        <div class="py-0 pt-4 md:py-4 flex flex-col lg:flex-row lg:items-center gap-2">
          <h2 class="text-3xl font-bold">
            Garden
          </h2>
          <button
            class="btn btn-sm text-sm w-fit" :class="(isTakingScreenshot.val) ? 'hidden' : ''"
            @click="openNewLayoutModal()"
          >
            <span>
              <font-awesome-icon :icon="['fas', 'table-cells-large']" />
            </span>
            New Layout
          </button>
        </div>
        <div class="md:hidden py-2 text-xs opacity-40" :class="(isTakingScreenshot.val) ? 'hidden' : ''">
          <h2 class="font-bold">
            Are you on a small screen?
          </h2>
          <p>The garden grid is scrollable!</p>
        </div>
      </div>
      <div class="flex flex-col" :class="(gardenTilesAreWide) ? '' : 'md:flex-row'">
        <div :class="(gardenTilesAreWide && !isTakingScreenshot.val) ? 'overflow-x-auto py-2' : ''">
          <div
            class="rounded-xl md:w-fit p-2 bg-base-300" :class="(isTakingScreenshot.val) ? 'w-fit' : 'w-full'"
            @contextmenu.prevent.self=""
          >
            <div ref="plotsDisplay" class="w-full overflow-auto lg:overflow-auto flex flex-col gap-3 p-3">
              <div v-for="(plotRow, plotRowIndex) in gardenTiles" :key="plotRowIndex" class="plotRow flex gap-3">
                <div v-for="(plot, plotIndex) in plotRow" :key="plotIndex" class="plot flex flex-col gap-1 relative">
                  <div v-for="(row, rowIndex) in plot.tiles" :key="rowIndex" class="plotTileRow flex cols-3 gap-1">
                    <div v-for="(tile, index) in row" :key="index" class="plotTile">
                      <CropTile
                        :tile="tile as Tile" :is-disabled="!plot.isActive" :bonus-hovered="hoveredBonus"
                        :is-alt="(plotRowIndex + plotIndex) % 2 === 0"
                        @contextmenu="((e: MouseEvent) => handleRightClick(e, rowIndex, index, plot as Plot))"
                        @click="(event: MouseEvent) => selectTile(event, rowIndex, index, plot as Plot)"
                        @mouseover="handleHover(rowIndex, index, plot as Plot)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="my-2 px-2 w-fit">
          <div
            ref="statDisplay" class="flex flex-wrap gap-2 w-fit px-4 mt-4 cursor-help"
            :class="(gardenTilesAreWide) ? '' : 'lg:grid lg:grid-cols-2'"
          >
            <CoverageStat
              :total-crops="plotStatTotal.cropCount"
              :covered="plotStatTotal.cropBonusCoverage['Quality Increase']" class="text-amber-600"
              @mouseover="hoveredBonus = Bonus.QualityIncrease" @mouseleave="hoveredBonus = Bonus.None"
            >
              <template #icon>
                <font-awesome-icon :icon="['fas', 'star']" />
              </template>
              <template #title>
                Quality Increase
              </template>
            </CoverageStat>

            <CoverageStat
              :total-crops="plotStatTotal.cropCount"
              :covered="plotStatTotal.cropBonusCoverage['Harvest Increase']" class="text-green-600"
              @mouseover="hoveredBonus = Bonus.HarvestIncrease" @mouseleave="hoveredBonus = Bonus.None"
            >
              <template #icon>
                <font-awesome-icon :icon="['fas', 'wheat-awn']" />
              </template>
              <template #title>
                Harvest Increase
              </template>
            </CoverageStat>
            <CoverageStat
              :total-crops="plotStatTotal.cropCount"
              :covered="plotStatTotal.cropBonusCoverage['Water Retain']" class="text-sky-500"
              @mouseover="hoveredBonus = Bonus.WaterRetain" @mouseleave="hoveredBonus = Bonus.None"
            >
              <template #icon>
                <font-awesome-icon :icon="['fas', 'droplet']" />
              </template>
              <template #title>
                Water Retain
              </template>
            </CoverageStat>

            <CoverageStat
              :total-crops="plotStatTotal.cropCount"
              :covered="plotStatTotal.cropBonusCoverage['Speed Increase']" class="text-orange-400"
              @mouseover="hoveredBonus = Bonus.SpeedIncrease" @mouseleave="hoveredBonus = Bonus.None"
            >
              <template #icon>
                <font-awesome-icon :icon="['fas', 'forward-fast']" />
              </template>
              <template #title>
                Growth Boost
              </template>
            </CoverageStat>

            <CoverageStat
              :total-crops="plotStatTotal.cropCount"
              :covered="plotStatTotal.cropBonusCoverage['Weed Prevention']" class="text-rose-400"
              @mouseover="hoveredBonus = Bonus.WeedPrevention" @mouseleave="hoveredBonus = Bonus.None"
            >
              <template #icon>
                <font-awesome-icon :icon="['fas', 'shield']" />
              </template>
              <template #title>
                Weed Prevention
              </template>
            </CoverageStat>
          </div>
        </div>
      </div>
    </section>

    <div class="flex flex-col gap-2 px-4 lg:px-16 max-w-xl py-1">
      <button class="btn my-0 btn-warning w-fit text-white" @click="clearAllPlots()">
        <font-awesome-icon class="text-xl" :icon="['fas', 'triangle-exclamation']" />
        <p>Clear Plot</p>
      </button>
    </div>

    <div class="flex flex-col gap-2 px-1 lg:px-16 max-w-4xl py-1">
      <HarvestCalculator :layout="garden as Garden" />
    </div>
    <div class="divider px-16" />
    <section id="save-load-export" class="flex flex-col gap-2 px-4 lg:px-16 max-w-4xl py-4 pb-12">
      <h2 class="text-2xl font-bold">
        Save/Load
      </h2>
      <p>
        Save your layout as a code to share with others, load a layout from a code, or export it as an image for instant
        sharing
      </p>

      <p class="text-xs">
        Note: Clipboard buttons may not function as intended, if so please manually copy/paste the code
      </p>
      <div class="">
        <div class="tabs tabs-boxed font-bold text-2xl rounded-b-none p-2">
          <div class="tab tab-lg" :class="activeTab === 'load' ? 'tab-active' : ''" @click="setActiveTab('load')">
            Load
          </div>
          <div class="tab tab-lg" :class="activeTab === 'save' ? 'tab-active' : ''" @click="setActiveTab('save')">
            Save
          </div>
          <p class="tab tab-lg" :class="activeTab === 'export' ? 'tab-active' : ''" @click="setActiveTab('export')">
            Export
          </p>
        </div>
        <div class="flex flex-col gap-4 py-4 px-4 bg-base-200 rounded-b-lg">
          <div v-show="activeTab === 'load'" class="flex flex-col gap-2 w-full">
            <h4 class="font-semibold text-lg">
              Load Code
            </h4>
            <p class="text-sm">
              Paste the layout code into the text-box then hit 'Load', if the layout-code is valid you
              will
              see it in the garden above
            </p>
            <div class="join w-full">
              <button class="btn btn-accent join-item text-white" @click="loadLayoutFromCode(loadCode)">
                Load
              </button>
              <button class="btn bg-base-100 join-item text-lg" @click="paste()">
                <font-awesome-icon :icon="['fas', 'paste']" />
              </button>
              <input
                v-model="loadCode" type="text"
                class="join-item bg-white bg-opacity-60 flex items-center justify-center px-2 py-1 w-full max-w-lg"
              >
            </div>
            <div class="flex items-center gap-1">
              Support Versions: <span class="text-sm font-bold badge badge-primary">v0.1</span> <span class="text-sm font-bold badge badge-secondary">v0.2</span>
            </div>
          </div>

          <div v-show="activeTab === 'save'" class="flex flex-col gap-2 w-full">
            <div class="pb-1">
              <h4 class="font-semibold text-lg">
                As Code
              </h4>
              <p class="text-sm">
                For later sharing/editing/loading, simply copy to clipboard
              </p>
              <div class="join w-full">
                <button class="btn btn-accent join-item text-white" @click="saveLayoutAsCode()">
                  Get Code
                </button>
                <button class="btn bg-base-100 join-item text-lg" @click="copy(saveCode)">
                  <font-awesome-icon :icon="['fas', 'copy']" />
                </button>
                <input
                  v-model="saveCode" type="text"
                  class="join-item bg-white bg-opacity-60 flex items-center justify-center px-2 py-1 w-full max-w-lg"
                >
              </div>
            </div>
            <div class="pb-1">
              <h4 class="font-semibold text-lg">
                As Link
              </h4>
              <p class="text-sm">
                Same as code, but converted to a shareable link
              </p>
              <div class="join w-full">
                <button class="btn btn-accent join-item text-white" @click="saveLayoutAsLink()">
                  Get Link
                </button>
                <button class="btn bg-base-100 join-item text-lg" @click="copy(saveLink)">
                  <font-awesome-icon :icon="['fas', 'copy']" />
                </button>
                <input
                  v-model="saveLink" type="text"
                  class="join-item bg-white bg-opacity-60 flex items-center justify-center px-2 py-1 w-full max-w-lg"
                >
              </div>
              <label class="flex gap-2 py-2 text-xs items-center font-semibold">
                <input v-model="useMarkdown" type="checkbox" class="toggle toggle-sm">
                <div class="join-item">Mask link with Markdown</div>
              </label>
            </div>
          </div>
          <div v-show="activeTab === 'export'" class="flex flex-col gap-2 w-full">
            <div class="pb-1">
              <h4 class="font-semibold text-lg">
                As Image
              </h4>
              <p class="text-sm">
                Converts your layout into an easily-shareable image and downloads it.
                Good for those whose screens cannot fit the entire garden.
              </p>
              <button class="btn btn-accent text-white my-2" @click="saveAsImage()">
                Download Image
              </button>
              <div class="flex flex-col gap-2">
                <p class="text-xs max-w-lg">
                  <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-warning" />
                  Page will slow down based on garden size while capturing the image
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="px-4 md:px-8 lg:px-16">
      <CreditsSection />
    </div>
  </main>
</template>
