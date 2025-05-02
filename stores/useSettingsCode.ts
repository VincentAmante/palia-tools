import { defineStore } from 'pinia'

export const useSettingsCode = defineStore('settingsCode', () => {
  const val = ref('')
  const code = computed(() => val.value)
  const set = (newVal: string) => {
    val.value = newVal
  }

  // Add a flag to track if an update is requested, mostly from loading a layout
  const updateIsRequestedVal = ref(false)
  const updateIsRequested = computed(() => updateIsRequestedVal.value)
  const requestUpdate = () => {
    updateIsRequestedVal.value = true
  }
  const resetUpdateRequest = () => {
    updateIsRequestedVal.value = false
  }

  return {
    code,
    set,
    updateIsRequested,
    requestUpdate,
    resetUpdateRequest,
  }
})
