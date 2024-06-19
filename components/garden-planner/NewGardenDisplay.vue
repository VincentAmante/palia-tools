<script setup lang="ts">
import { useTakingScreenshot } from '~/stores/useIsTakingScreenshot'
import useGarden from '~/stores/useGarden'
import type { Crop, Fertiliser, Plot, Tile } from '~/assets/scripts/garden-planner/imports'
import { SelectedItemType, useSelectedItem } from '~/stores/useSelectedItem'
import { useDragAndDrop } from '~/stores/useDragAndDrop'

const isTakingScreenshot = useTakingScreenshot()
const gardenHandler = useGarden()
const { garden, update, isGardenWide } = gardenHandler

const plotsDisplay = ref<HTMLDivElement | null>(null)
const selectedItem = useSelectedItem()
const dragHandler = useDragAndDrop()

function resetHover() {
  for (const row of garden.plots) {
    for (const plot of row)
      plot.resetTileHover()
  }
}

function selectTile(event: MouseEvent, row: number, col: number, plot: Plot) {
  if (event.button === 2)
    return

  resetHover()

  // if (selectedItem.type === SelectedItemType.CropErase)
  switch (selectedItem.type) {
    case SelectedItemType.CropErase:
      plot.setTile(row, col, null)
      break
    case SelectedItemType.FertiliserErase:
      plot.removeCropFromTile(row, col)
      break
    case SelectedItemType.Crop:
      plot.setTile(row, col, selectedItem.val as Crop)
      break
    case SelectedItemType.Fertiliser:
      plot.addFertiliserToTile(row, col, selectedItem.val as Fertiliser, {
        removeSameId: true,
      })
  }

  update()
}

function onMouseLeave() {
  resetHover()
  dragHandler.clearTileCoords()
}

function handleRightClick(row: number, col: number, plot: Plot) {
  if (!plot.isActive)
    return

  const tile = plot.getTile(row, col)
  if (!tile)
    return

  if (tile.fertiliser)
    plot.removeFertiliserFromTile(row, col)
  else if (tile.crop)
    plot.setTile(row, col, null)
  else return

  update()
}

const isRightClickDown = ref(false)
const { pressed } = useMousePressed()

function onHover(row: number, col: number, plot: Plot) {
  resetHover()

  if (selectedItem.type === SelectedItemType.Crop || selectedItem.type === SelectedItemType.Fertiliser)
    plot.onTileHover(row, col, selectedItem.val as Crop | Fertiliser)

  if (pressed.value && !isRightClickDown.value) {
    switch (selectedItem.type) {
      case SelectedItemType.CropErase:
        plot.setTile(row, col, null)
        break
      case SelectedItemType.FertiliserErase:
        plot.removeCropFromTile(row, col)
        break
      case SelectedItemType.Crop:
        if (plot.getTile(row, col)?.crop?.type !== (selectedItem.val as Crop).type)
          plot.setTile(row, col, selectedItem.val as Crop)
        break
      case SelectedItemType.Fertiliser:
        plot.addFertiliserToTile(row, col, selectedItem.val as Fertiliser, {
          removeSameId: true,
        })
        break
    }
  }

  else if (pressed.value && isRightClickDown.value) {
    handleRightClick(row, col, plot)
  }

  update()
}

onMounted(() => {
  useEventListener('mousedown', (event: MouseEvent) => {
    if (event.button === 2)
      isRightClickDown.value = true
  })
  useEventListener('mouseup', (event: MouseEvent) => {
    if (event.button === 2)
      isRightClickDown.value = false
  })
})

function onMiddleClick(row: number, col: number, plot: Plot) {
  if (!plot.isActive)
    return

  const tile = plot.getTile(row, col)

  if (tile?.crop)
    selectedItem.select(tile.crop)
  else if (tile?.fertiliser)
    selectedItem.select(tile.fertiliser)
  else
    return

  update()
}

function onDragEnter(row: number, col: number, plot: Plot) {
  dragHandler.onTileEnter(row, col, plot)
}
</script>

<template>
  <section
    class="flex flex-col items-center h-full"
    :class="[((isTakingScreenshot.get && isGardenWide) || isTakingScreenshot.get) ? 'max-w-[1680px]' : 'max-w-[100vw]']"
  >
    <div
      class="px-3 my-4 rounded-xl md:my-0 lg:ml-0 lg:mr-auto lg:px-2"
      :class="(isTakingScreenshot.get) ? 'w-fit px-1 mt-0' : 'w-full sm:w-fit'"
      @contextmenu.prevent.self=""
    >
      <div ref="plotsDisplay" class="grid w-full gap-2 pr-12 overflow-auto sm:pr-0">
        <div v-for="(plotRow, plotRowIndex) in garden.plots" :key="plotRowIndex" class="flex gap-2 plotRow">
          <div v-for="(plot, plotIndex) in plotRow" :key="plotIndex" class="relative flex flex-col gap-0 plot">
            <div v-for="(row, rowIndex) in plot.tiles" :key="rowIndex" class="flex gap-0 plotTileRow cols-3">
              <div v-for="(tile, index) in row" :key="index" class="plotTile">
                <CropTile
                  :tile="tile as Tile"
                  :is-disabled="!plot.isActive"
                  :bonus-hovered="useGarden().getHoveredBonus"
                  :index="(1 + rowIndex) + (index + (rowIndex * 2))"
                  @mousedown.middle.prevent.stop
                  @click.left="(event: MouseEvent) => selectTile(event, rowIndex, index, plot as Plot)"
                  @click.right="(() => handleRightClick(rowIndex, index, plot as Plot))"
                  @mouseover="onHover(rowIndex, index, plot as Plot)"
                  @mouseleave="onMouseLeave"
                  @click.middle="(() => onMiddleClick(rowIndex, index, plot as Plot))"
                  @dragenter="(() => onDragEnter(rowIndex, index, plot as Plot))"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
