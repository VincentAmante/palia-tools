<script setup lang="ts">
import { CropCode } from '@/assets/scripts/garden-planner/imports'
import PGPModal from '@/components/PGPModal.vue'

const emit = defineEmits(['createNewLayout'])

const modal = ref<InstanceType<typeof PGPModal> | null>(null)
// const createLayoutDialog = ref<HTMLDialogElement | null>(null)
function openModal() {
  modal.value?.showModal()
}
defineExpose({
  openModal,
})

const selectedNewLayout = ref('3x3')
const prevSelectedNewLayout = ref('3x3')
function createNewLayout() {
  emit('createNewLayout', layoutToCode(trimLayout()))
  modal.value?.hideModal()
}

enum PlotStatus {
  active = 1,
  inactive = 0,
}
// Creates a v.02 code from the layout
function layoutToCode(layout: PlotStatus[][]) {
  // ? technically 'plot' is just a boolean, do I really need to use an enum?
  let code = 'v0.2_DIM-'
  for (const layoutRow of layout) {
    for (const plot of layoutRow)
      code += plot

    code += '-'
  }
  code = code.slice(0, -1)
  code += '_CROPS-'
  for (const plot of layout.flat()) {
    if (plot === PlotStatus.active) {
      for (let i = 0; i < 9; i++)
        code += CropCode.None

      code += '-'
    }
  }
  code = code.slice(0, -1)
  return code
}

const rowInput = ref(3)
const colInput = ref(3)

const plotLayout = ref<PlotStatus[][]>([
  [PlotStatus.inactive],
])

function onLayoutSelect() {
  if (selectedNewLayout.value !== 'custom') {
    rowInput.value = Number.parseInt(selectedNewLayout.value[0])
    colInput.value = Number.parseInt(selectedNewLayout.value[2])
  }
  else {
    rowInput.value = 4
    colInput.value = 4
  }
}

const MAX_ROWS = 9
const MAX_COLS = 9
watchEffect(() => {
  if (rowInput.value > MAX_ROWS)
    rowInput.value = MAX_ROWS
  if (colInput.value > MAX_COLS)
    colInput.value = MAX_COLS

  const selectedRow = rowInput.value
  const selectedCol = colInput.value
  const layout: PlotStatus[][] = []
  for (let i = 0; i < selectedRow; i++) {
    layout[i] = []
    for (let j = 0; j < selectedCol; j++) {
      // Allows for keeping the same layout when switching between custom layouts
      if (selectedNewLayout.value === prevSelectedNewLayout.value && plotLayout.value[i] && plotLayout.value[i][j]) {
        layout[i][j] = plotLayout.value[i][j]
        continue
      }

      layout[i][j] = (selectedNewLayout.value === 'custom' ? PlotStatus.inactive : PlotStatus.active)
    }
  }
  plotLayout.value = layout
  prevSelectedNewLayout.value = selectedNewLayout.value
})

function enforceLayoutLimits() {
  if (rowInput.value > MAX_ROWS)
    rowInput.value = MAX_ROWS
  if (colInput.value > MAX_COLS)
    colInput.value = MAX_COLS
  if (rowInput.value < 1)
    rowInput.value = 1
  if (colInput.value < 1)
    colInput.value = 1
}

const activePlots = computed(() => {
  return plotLayout.value.flat().reduce((count, isActive) => {
    return count + isActive
  }, 0)
})

const allowIllegalLayout = ref(false)
function togglePlot(row: number, col: number) {
  const maxPlots = (allowIllegalLayout.value ? 27 : 9)
  if (plotLayout.value[row][col] === PlotStatus.active) {
    plotLayout.value[row][col] = PlotStatus.inactive
  }
  else {
    if (activePlots.value >= maxPlots)
      return
    plotLayout.value[row][col] = PlotStatus.active
  }
}

function trimLayout(): PlotStatus[][] {
  const layout: PlotStatus[][] = plotLayout.value

  // Identify empty rows and columns
  const emptyRows: Set<number> = new Set()
  const emptyColumns: Set<number> = new Set()
  for (let row = 0; row < layout.length; row++) {
    let isEmpty = true
    for (let col = 0; col < layout[row].length; col++) {
      if (layout[row][col] === PlotStatus.active) {
        isEmpty = false
        break
      }
    }
    if (isEmpty)
      emptyRows.add(row)
  }
  for (let col = 0; col < layout[0].length; col++) {
    let isEmpty = true
    for (let row = 0; row < layout.length; row++) {
      if (layout[row][col] === PlotStatus.active) {
        isEmpty = false
        break
      }
    }
    if (isEmpty)
      emptyColumns.add(col)
  }

  // Remove empty rows and columns
  for (let row = layout.length - 1; row >= 0; row--) {
    if (emptyRows.has(row))
      layout.splice(row, 1)
  }
  for (let col = layout[0].length - 1; col >= 0; col--) {
    if (emptyColumns.has(col)) {
      for (let row = 0; row < layout.length; row++)
        layout[row].splice(col, 1)
    }
  }

  rowInput.value = layout.length
  colInput.value = layout[0].length
  return layout
}
</script>

<template>
  <PGPModal ref="modal">
    <template #header>
      New Layout
    </template>
    <template #body>
      <div class="flex flex-col gap-1 bg-palia-blue-dark rounded-md p-2 ">
        <h3 class="font-bold">
          Dimensions
        </h3>
        <select
          v-model="selectedNewLayout"
          name="layout-select" class="select select-bordered select-sm w-full max-w-xs"
          aria-label="Select Layout"
          @change="onLayoutSelect()"
        >
          <option value="select" disabled selected>
            Select Layout
          </option>
          <option value="1x2">
            1x2
          </option>
          <option value="2x1">
            2x1
          </option>
          <option value="2x2">
            2x2
          </option>
          <option value="2x3">
            2x3
          </option>
          <option value="3x2">
            3x2
          </option>
          <option value="3x3">
            3x3
          </option>
          <option value="custom" class="italic">
            Custom Layout
          </option>
        </select>

        <p class="text-xs">
          Pick a pre-determined size here, or make a custom one
        </p>
      </div>
      <div class="flex flex-col gap-2 bg-palia-blue-dark rounded-md p-2">
        <div class=" py-2 flex flex-col gap-3">
          <div class="w-full flex flex-col items-center">
            <p class="text-sm">
              Each tile represents a 3x3 garden, click to toggle
            </p>
            <div class=" flex flex-col gap-1 py-4 px-2 rounded-md w-fit">
              <div v-for="(plotRow, plotRowIndex) of plotLayout" :key="plotRowIndex" class="flex gap-1">
                <div
                  v-for="(plot, index) of plotRow" :key="index"
                  class="btn btn-square rounded-none btn-accent btn-xs cursor-pointer transition-all"
                  :class="plot === PlotStatus.active ? 'border-misc-saturated' : 'bg-misc bg-opacity-70'" @click="togglePlot(plotRowIndex, index)"
                />
              </div>
            </div>

            <p class="flex gap-1 font-bold">
              <span class="flex items-center align-middle gap-1">
                {{ activePlots }} Plots
                out of
                {{ allowIllegalLayout ? 27 : 9 }}
              </span>
            </p>
          </div>
          <div :class="selectedNewLayout === 'custom' ? '' : 'hidden'" class="flex flex-col gap-2 w-fit md:w-full">
            <label for="row-input" class="items-center justify-start grid grid-cols-2 gap-2 w-fit">
              <p class="select-none text-sm ">Rows</p>
              <div class="join col-span-1 rounded-md">
                <button
                  class="join-item btn btn-sm btn-square btn-primary"
                  @click="() => {
                    if (rowInput <= 1)
                      return
                    rowInput--
                    enforceLayoutLimits()
                  }"
                >-</button>
                <input
                  v-model="rowInput" type="number" name="row-input"
                  class="join-item input input-sm max-w-16 text-center input-primary" min="1" max="9" step="1"
                  :disabled="selectedNewLayout !== 'custom'" @change="enforceLayoutLimits()"
                >
                <button
                  class="join-item btn btn-sm btn-square btn-primary" @click="() => {
                    if (rowInput >= MAX_ROWS)
                      return
                    rowInput++
                  }"
                >+</button>
              </div>
            </label>
            <label for="col-input" class="items-center justify-start grid grid-cols-2 gap-2 w-fit">
              <p class="select-none text-sm">Columns</p>
              <div class="join col-span-1 rounded-md">
                <button
                  class="join-item btn btn-sm btn-square btn-primary"
                  @click="() => {
                    if (colInput <= 1)
                      return
                    colInput--
                    enforceLayoutLimits()
                  }"
                >-</button>
                <input
                  v-model="colInput" type="number" name="col-input"
                  class="join-item input input-sm input-primary max-w-16 text-center" min="1" max="9" step="1"
                  :disabled="selectedNewLayout !== 'custom'" @change="enforceLayoutLimits()"
                >
                <button
                  class="join-item btn btn-sm btn-primary btn-square" @click="() => {
                    if (colInput >= MAX_COLS)
                      return
                    colInput++
                    enforceLayoutLimits()
                  }"
                >+</button>
              </div>
            </label>
          </div>
          <div v-if="selectedNewLayout === 'custom'" class="w-full flex flex-col gap-1  bg-misc-secondary px-2 rounded-md  py-2">
            <label class="label flex items-start border-white w-fit gap-2">
              <span class="text-sm">Allow Illegal Layout</span>
              <div class="flex flex-col">
                <input
                  v-model="allowIllegalLayout" type="checkbox" name="allow-illegal-layout"
                  class="toggle  rounded-sm"
                >
              </div>
            </label>
            <p class="text-xs opacity-40 font-thin">
              Increase the maximum amount of overall plots from 9 to 27
            </p>
          </div>
        </div>
      </div>
      <div class="text-xs max-w-xs">
        <p>Note: Empty rows and columns will be trimmed from the final output</p>
      </div>
      <div class="flex flex-col gap-1">
        <button
          :disabled="selectedNewLayout === 'select' || activePlots <= 0" class="btn w-fit"
          @click="createNewLayout()"
        >
          Create
        </button>

        <p v-show="(activePlots <= 0)" class="text-xs text-warning">
          <font-awesome-icon icon="exclamation-triangle" class="text-warning" />
          You'll need at least 1 plot active
        </p>
      </div>
    </template>
  </PGPModal>
</template>
