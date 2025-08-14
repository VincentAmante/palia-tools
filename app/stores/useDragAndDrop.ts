import { defineStore } from 'pinia'
import type { Garden, Plot } from '@/assets/scripts/garden-planner/imports'
import { CropType, FertiliserType, getCropFromType, getFertiliserFromType } from '@/assets/scripts/garden-planner/imports'

type DragItem = CropType | FertiliserType | 'crop-erase' | 'fertiliser-erase' | null

interface ITileCoords {
  x: number
  y: number
  plot: Plot
}

export const useDragAndDrop = defineStore('dragAndDrop', () => {
  const draggedItem = ref<DragItem>(null)
  const isDragging = ref(false)
  const tileCoords = ref<ITileCoords | null>(null)
  const garden = ref<Garden | null>(null)

  function setGarden(g: Garden) {
    garden.value = g
  }

  function startDrag(item: DragItem) {
    draggedItem.value = item
    isDragging.value = true
  }

  function stopDrag() {
    if (tileCoords.value === null) {
      draggedItem.value = null
      isDragging.value = false
      return
    }

    const { x, y, plot } = tileCoords.value

    // Remove crop or fertiliser from tile
    if (draggedItem.value === 'crop-erase')
      plot.setTile(x, y, null)
    else if (draggedItem.value === 'fertiliser-erase')
      plot.removeFertiliserFromTile(x, y)

    if (draggedItem.value === null) {
      isDragging.value = false
      return
    }

    // Add crop or fertiliser to tile
    if (Object.values(CropType).includes(draggedItem.value as CropType)) {
      plot.setTile(x, y, getCropFromType(draggedItem.value as CropType))
    }
    else if (Object.values(FertiliserType).includes(draggedItem.value as FertiliserType)) {
      plot.addFertiliserToTile(x, y, getFertiliserFromType(draggedItem.value as FertiliserType), {
        removeSameId: true,
      })
    }

    garden.value?.calculateBonuses()

    draggedItem.value = null
    isDragging.value = false
  }

  function onTileEnter(x: number, y: number, plot: Plot) {
    tileCoords.value = { x, y, plot }
  }

  function clearTileCoords() {
    tileCoords.value = null
  }

  return { draggedItem, isDragging, startDrag, stopDrag, onTileEnter, setGarden, clearTileCoords }
})
