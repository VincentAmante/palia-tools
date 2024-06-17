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

  function select(item: SelectedItem) {
    selectedItem.value = item
  }

  const type = computed(() => {
    return getSelectedItemType(selectedItem.value as SelectedItem)
  })

  const val = computed(() => selectedItem.value)

  return {
    select,
    val,
    type,
  }
})
