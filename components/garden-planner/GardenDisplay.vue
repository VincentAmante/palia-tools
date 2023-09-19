<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Plot, Tile } from '@/assets/scripts/garden-planner/imports'
import { useTakingScreenshot } from '@/stores/useIsTakingScreenshot'

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
const emit = defineEmits(['selectTile', 'rightClick', 'mouseover', 'updateGardenTiles'])

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
const { get: isTakingScreenshot } = storeToRefs(useTakingScreenshot())

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
</script>

<template>
  <div
    class="h-full flex flex-col justify-center "
    :class="(gardenTilesAreWide && !isTakingScreenshot) ? 'overflow-x-auto' : ''"
  >
    <div
      class="rounded-xl sm:w-fit sm:mx-auto rpx-3 lg:px-1 bg-accent" :class="(isTakingScreenshot) ? 'w-fit' : 'w-full'"
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
