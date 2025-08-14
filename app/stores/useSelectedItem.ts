import { defineStore } from 'pinia'
import { Crop, Fertiliser } from '@/assets/scripts/garden-planner/imports'

export type SelectedItem = Crop | Fertiliser | 'crop-erase' | 'fertiliser-erase' | null

export enum SelectedItemType {
  Crop = 'crop',
  Fertiliser = 'fertiliser',
  CropErase = 'crop-erase',
  FertiliserErase = 'fertiliser-erase',
}

export function getSelectedItemType(item: SelectedItem): SelectedItemType | null {
  if (!item)
    return null

  if (item === 'crop-erase')
    return SelectedItemType.CropErase
  if (item === 'fertiliser-erase')
    return SelectedItemType.FertiliserErase
  if (item instanceof Crop)
    return SelectedItemType.Crop
  if (item instanceof Fertiliser)
    return SelectedItemType.Fertiliser

  return null
}

export const useSelectedItem = defineStore('selectedItem', () => {
  const selectedItem = ref<SelectedItem>(SelectedItemType.CropErase)

  const hoveredItem = ref<SelectedItem | null>()

  function select(item: SelectedItem) {
    selectedItem.value = item
  }

  function hover(item: SelectedItem | null){
    hoveredItem.value = item
  }

  const type = computed(() => {
    return getSelectedItemType(selectedItem.value as SelectedItem)
  })

  const hoverType = computed(() => {
    return getSelectedItemType(hoveredItem.value as SelectedItem | null)
  })

  const val = computed(() => selectedItem.value)

  const hoverVal = computed(() => hoveredItem.value)

  return {
    select,
    val,
    type,
    hover,
    hoverVal,
    hoverType
  }
})
