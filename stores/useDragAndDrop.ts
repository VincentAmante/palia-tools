import { defineStore } from 'pinia'
import CropType from '~/assets/scripts/garden-planner/enums/crops'
import FertiliserType from '~/assets/scripts/garden-planner/enums/fertiliser'
import { getCropFromType } from '~/assets/scripts/garden-planner/cropList'
import { getFertiliserFromType } from '~/assets/scripts/garden-planner/fertiliserList'
import type { Coordinates } from '~/assets/scripts/garden-planner/utils/coordinates'
type DragItem = CropType | FertiliserType | 'crop-erase' | 'fertiliser-erase' | null

export const useDragAndDrop = defineStore('dragAndDrop', () => {
  const draggedItem = ref<DragItem>(null)
  const isDragging = ref(false)
  const tileCoords = ref<Coordinates | null>(null)
  const garden = useGardenGrid()

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

    // Remove crop or fertiliser from tile
    if (draggedItem.value === 'crop-erase')
      garden.placeCrop(tileCoords.value, null)
      // plot.setTile(x, y, null)
    else if (draggedItem.value === 'fertiliser-erase')
      garden.placeFertiliser(tileCoords.value, null)

    if (draggedItem.value === null) {
      isDragging.value = false
      return
    }

    // Add crop or fertiliser to tile
    if (Object.values(CropType).includes(draggedItem.value as CropType)) {
      garden.placeCrop(tileCoords.value, getCropFromType(draggedItem.value as CropType))
    }
    else if (Object.values(FertiliserType).includes(draggedItem.value as FertiliserType)) {
      garden.placeFertiliser(tileCoords.value, getFertiliserFromType(draggedItem.value as FertiliserType))
    }

    draggedItem.value = null
    isDragging.value = false
  }

  function onTileEnter(coords: Coordinates) {
    tileCoords.value = coords
  }

  function clearTileCoords() {
    tileCoords.value = null
  }

  return { draggedItem, isDragging, startDrag, stopDrag, onTileEnter, clearTileCoords }
})
