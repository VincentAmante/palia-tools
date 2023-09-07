<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { CropCode } from '@/assets/scripts/garden-planner/imports'

const emit = defineEmits(['createNewLayout'])
const createLayoutDialog = ref<HTMLDialogElement | null>(null)
function openModal() {
  createLayoutDialog.value?.showModal()
}
defineExpose({
  openModal,
})

const selectedNewLayout = ref('3x3')
const prevSelectedNewLayout = ref('3x3')
function createNewLayout() {
  emit('createNewLayout', layoutToCode(trimLayout()))
  createLayoutDialog.value?.close()
}

enum PlotStatus {
  active = 1,
  inactive = 0,
}
// Creates a v.01 code from the layout
function layoutToCode(layout: PlotStatus[][]) {
  // * technically 'plot' is just a boolean, do I really need to use an enum?
  let code = 'v0.1_DIM-'
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

const MAX_PLOTS = 9
watchEffect(() => {
  if (rowInput.value > 9)
    rowInput.value = 9
  if (colInput.value > 9)
    colInput.value = 9
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
  if (rowInput.value > 9)
    rowInput.value = 9
  if (colInput.value > 9)
    colInput.value = 9
  if (rowInput.value < 1)
    rowInput.value = 1
  if (colInput.value < 1)
    colInput.value = 1
}

const activePlots = computed(() => {
  let count = 0
  for (let i = 0; i < plotLayout.value.length; i++) {
    for (let j = 0; j < plotLayout.value[i].length; j++) {
      if (plotLayout.value[i][j] === PlotStatus.active) {
        count++
      }
    }
  }
  return count
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
  return layout
}
</script>

<template>
  <dialog id="create-layout" ref="createLayoutDialog" class="modal">
    <form ref="createLayoutForm" method="dialog" class="modal-box flex flex-col gap-2" @submit.prevent="">
      <h3 className="font-bold text-xl">
        New Layout
      </h3>
      <div class="flex flex-col gap-1">
        <h4 class="font-bold">
          Dimensions
        </h4>
        <p class="text-xs">
          Pick a pre-determined size here, or make a custom one
        </p>
        <select
          v-model="selectedNewLayout" class="select select-bordered select-sm w-full max-w-xs"
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
      </div>
      <div class="flex flex-col gap-1">
        <h4 class="font-bold">
          Editor
        </h4>
        <div>
          <div class="flex items-start flex-col bg-base-200 p-2 rounded-md w-fit">
            <p class="flex gap-1 font-bold">
              Active Plots: <span class="flex items-center align-middle gap-1">{{ activePlots
              }}<span class="text-xs">/</span>{{ allowIllegalLayout ? 27 : 9 }}</span>
            </p>
            <label v-show="selectedNewLayout === 'custom'" class="label w-fit flex flex-col items-start">
              <span class="text-sm">Allow Illegal Layout</span>
              <div class="flex gap-1 pt-1">
                <input
                  v-model="allowIllegalLayout" type="checkbox" name="allow-illegal-layout"
                  class="toggle toggle-sm"
                >
              </div>
              <span class="text-xs">3x the max count</span>
            </label>
          </div>
          <p class="text-sm">
            Click on any plot-tile to determine if there is a plot there or not
          </p>
        </div>
        <div class=" py-2 flex flex-col  gap-2">
          <div :class="selectedNewLayout === 'custom' ? '' : 'hidden'" class="flex flex-col gap-2">
            <label for="row-input" class="flex items-center justify-start gap-2">
              <p class="select-none">Rows</p>
              <div class="join">
                <button class="join-item btn btn-sm btn-accent text-white" @click="rowInput--">-</button>
                <input
                  v-model="rowInput" type="number" name="row-input"
                  class="join-item input input-accent input-sm max-w-16 text-center" min="1" max="9" step="1"
                  :disabled="selectedNewLayout !== 'custom'" @change="enforceLayoutLimits()"
                >
                <button class="join-item btn btn-sm btn-accent text-white" @click="rowInput++">+</button>
              </div>
            </label>
            <label for="col-input" class="flex items-center justify-start gap-2">
              <p class="select-none">Columns</p>
              <div class="join">
                <button class="join-item btn btn-sm btn-accent text-white" @click="colInput--">-</button>
                <input
                  v-model="colInput" type="number" name="col-input"
                  class="join-item input input-accent input-sm max-w-16" min="1" max="9" step="1"
                  :disabled="selectedNewLayout !== 'custom'" @change="enforceLayoutLimits()"
                >
                <button class="join-item btn btn-sm btn-accent text-white" @click="colInput++">+</button>
              </div>
            </label>
          </div>
          <div class=" flex flex-col gap-1 py-4 bg-base-300 px-2 rounded-md w-fit">
            <div v-for="(plotRow, plotRowIndex) of plotLayout" :key="plotRowIndex" class="flex gap-1">
              <div
                v-for="(plot, index) of plotRow" :key="index"
                class="aspect-square border-2 border-accent rounded w-6 cursor-pointer hover:bg-accent hover:bg-opacity-50 transition-all"
                :class="plot === PlotStatus.active ? 'bg-accent' : ''" @click="togglePlot(plotRowIndex, index)"
              />
            </div>
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
    </form>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
