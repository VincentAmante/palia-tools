import { defineStore } from 'pinia'

export const useUiSettings = defineStore('uiSettings', () => {
  const showBonusIcons = ref(false)

  function toggleBonusIconsVisibility() {
    showBonusIcons.value = !showBonusIcons.value
  }

  return {
    showBonusIcons,
    toggleBonusIconsVisibility,
  }
})
