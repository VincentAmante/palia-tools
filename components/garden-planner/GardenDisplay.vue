<script setup lang="ts">
import type { Plot, Tile } from '@/assets/scripts/garden-planner/imports'
import { useTakingScreenshot } from '@/stores/useIsTakingScreenshot'
import { useDragAndDrop } from '@/stores/useDragAndDrop'

defineProps({
  gardenTiles: {
    type: Array as PropType<Plot[][]>,
    required: true,
  },
  hoveredBonus: {
    type: String,
    default: '',
  },
  gardenTilesAreWide: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['selectTile', 'rightClick', 'mouseover', 'updateGardenTiles', 'mouseup'])

const plotsDisplay = ref<HTMLDivElement | null>(null)
function getPlotsDisplay() {
  return plotsDisplay.value
}

function modifyPlotsDisplayClassList(callback: (classList: DOMTokenList) => void) {
  const plotsDisplay = getPlotsDisplay()
  if (plotsDisplay)
    callback(plotsDisplay.classList)
}

defineExpose({
  getPlotsDisplay,
  modifyPlotsDisplayClassList,
})
const isTakingScreenshot = useTakingScreenshot()

function selectTile(event: MouseEvent, rowIndex: number, index: number, plot: Plot) {
  if (plot.isActive)
    emit('selectTile', event, rowIndex, index, plot)
}

function handleRightClick(event: MouseEvent, rowIndex: number, index: number, plot: Plot) {
  if (plot.isActive)
    emit('rightClick', event, rowIndex, index, plot)
}

function handleHover(rowIndex: number, index: number, plot: Plot) {
  if (plot.isActive)
    emit('mouseover', rowIndex, index, plot)
}

function handleMouseUp(rowIndex: number, index: number, plot: Plot) {
  if (plot.isActive)
    emit('mouseup', rowIndex, index, plot)
}

const dragHandler = useDragAndDrop()
function handleDragEnter(row: number, col: number, plot: Plot) {
  dragHandler.onTileEnter(row, col, plot)
}
</script>

<template>
  <div
    class="h-full flex flex-col items-center"
    :class="[(isTakingScreenshot.get && gardenTilesAreWide) ? '' : 'max-w-[100vw]']"
  >
    <div
      class="rounded-xl w-fit my-4 md:my-0 mx-auto lg:ml-0 lg:mr-auto px-3 lg:px-2 bg-accent"
      :class="(isTakingScreenshot.get) ? 'w-fit mx-auto px-1' : ''"
      @contextmenu.prevent.self=""
    >
      <div ref="plotsDisplay" class="w-full overflow-auto grid gap-2">
        <div v-for="(plotRow, plotRowIndex) in gardenTiles" :key="plotRowIndex" class="plotRow flex gap-2">
          <div v-for="(plot, plotIndex) in plotRow" :key="plotIndex" class="plot flex flex-col gap-0 relative">
            <div v-for="(row, rowIndex) in plot.tiles" :key="rowIndex" class="plotTileRow flex cols-3 gap-0">
              <div v-for="(tile, index) in row" :key="index" class="plotTile">
                <CropTile
                  :tile="tile as Tile" :is-disabled="!plot.isActive" :bonus-hovered="hoveredBonus"
                  :index="(1 + rowIndex) + (index + (rowIndex * 2))"
                  :is-alt="(plotRowIndex + plotIndex) % 2 === 0"
                  @click.left="(event: MouseEvent) => selectTile(event, rowIndex, index, plot as Plot)"
                  @click.right="((e: MouseEvent) => handleRightClick(event, rowIndex, index, plot as Plot))"
                  @mouseover="handleHover(rowIndex, index, plot as Plot)"
                  @mouseup="(handleMouseUp(rowIndex, index, plot as Plot))"
                  @dragenter="(e: DragEvent) => handleDragEnter(rowIndex, index, plot as Plot)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
