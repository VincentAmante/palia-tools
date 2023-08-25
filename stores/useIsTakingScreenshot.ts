import { defineStore } from 'pinia'

// Way to globally define if the dom-to-image library is taking a screenshot
// Useful for hiding elements that should not be in the screenshot without having to pass a prop to every component
export const useTakingScreenshot = defineStore('isTakingScreenshot', () => {
  const val = ref(false)

  function set(newVal: boolean) {
    val.value = newVal
  }

  return {
    val,
    set,
  }
})
