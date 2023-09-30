<script setup lang="ts">
import { useClipboard, useMousePressed, useUrlSearchParams } from '@vueuse/core'
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

const display = ref(null as unknown as HTMLElement)
const statDisplay = ref<InstanceType<typeof StatsDisplay> | null>()
const gardenDisplay = ref<InstanceType<typeof GardenDisplay> | null>()

const isTakingScreenshot = useTakingScreenshot()
function saveAsImage() {
  isTakingScreenshot.set(true)
  let displayWidth = ((gardenDisplay.value?.getPlotsDisplay() as HTMLElement).clientWidth) + 200
  if (!gardenTilesAreWide.value)
    displayWidth += ((statDisplay.value?.getStatsDisplay() as HTMLElement).clientWidth)

  display.value.style.width = '1440px'
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
    <div class="flex flex-col w-full justify-center items-center">
      <section
        id="display" ref="display" class="lg:px-16 py-4 font-['Merriweather'] w-full max-w-[1680px]"
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
          <div class="grid lg:grid-cols-2 md:flex-row md:gap-4 pb-4" :class="(gardenTilesAreWide) ? 'md:flex-col' : ''">
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
                <button class="btn btn-accent">
                  Save
                </button>
                <button class="btn btn-accent">
                  Load
                </button>
                <button class="btn btn-accent">
                  Export
                </button>
              </div>
            </div>
            <TimeDisplay />
          </div>
        </div>
      </section>
    </div>

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
            <h3 class="font-semibold text-lg">
              Load Code
            </h3>
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
              <h3 class="font-semibold text-lg">
                As Code
              </h3>
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
              <h3 class="font-semibold text-lg">
                As Link
              </h3>
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
              <h3 class="font-semibold text-lg">
                As Image
              </h3>
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
