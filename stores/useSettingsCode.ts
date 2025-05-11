import { defineStore } from 'pinia'

export const useSettingsCode = defineStore('settingsCode', () => {
  const val = ref('')
  const includeSettingsCode = ref(true)

  const code = computed(() => (includeSettingsCode.value ? val.value : ''))
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
     includeSettingsCode
  }
})
