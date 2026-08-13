import { defineStore } from 'pinia'
import CropType from '~/assets/scripts/garden-planner/enums/crops'
import FertiliserType from '~/assets/scripts/garden-planner/enums/fertiliser'
import { getCropFromType } from '~/assets/scripts/garden-planner/cropList'
import { getFertiliserFromType } from '~/assets/scripts/garden-planner/fertiliserList'
import type { Coordinates } from '~/assets/scripts/garden-planner/utils/coordinates'
import { SelectedItemType, type SelectedItem } from '#imports'
import type Crop from '~/assets/scripts/garden-planner/classes/crop'
import type Fertiliser from '~/assets/scripts/garden-planner/classes/fertiliser'

export const useDragAndDrop = defineStore('dragAndDrop', () => {
  const draggedItem = ref<SelectedItem>(SelectedItemType.CropErase)
  const isDragging = ref(false)
  const tileCoords = ref<Coordinates | null>(null)
  const garden = useGardenGrid()

  const itemtype = computed(() => {
    return getSelectedItemType(draggedItem.value as SelectedItem)
  })


  function startDrag(item: SelectedItem) {
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
    else if (draggedItem.value === 'fertiliser-erase')
      garden.placeFertiliser(tileCoords.value, null)

    if (draggedItem.value === null) {
      isDragging.value = false
      return
    }

    // Add crop or fertiliser to tile
    if (itemtype.value === SelectedItemType.Crop) {
      garden.placeCrop(tileCoords.value, draggedItem.value as Crop)
    }
    else if (itemtype.value === SelectedItemType.Fertiliser) {
      garden.placeFertiliser(tileCoords.value, draggedItem.value as Fertiliser)
    }

    draggedItem.value = null
    isDragging.value = false
    clearTileCoords()
    garden.updateStats()
  }

  function onTileEnter(coords: Coordinates) {
    tileCoords.value = coords
    console.log(`tileCoords: ${coords}`)
  }

  function clearTileCoords() {
    tileCoords.value = null
  }

  return { draggedItem, tileCoords, itemtype, isDragging, startDrag, stopDrag, onTileEnter, clearTileCoords }
})
