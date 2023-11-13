import { defineStore } from 'pinia'
import type { Crop, Fertiliser } from '@/assets/scripts/garden-planner/imports'

type SelectedItem = Crop | Fertiliser | 'crop-erase' | 'fertiliser-erase' | null

export const useSelectedItem = defineStore('selectedItem', () => {
  const selectedItem = ref<SelectedItem>(null)

  function select(item: SelectedItem) {
    selectedItem.value = item
  }

  const val = computed(() => selectedItem.value)

  return {
    select,
    val,
  }
})
