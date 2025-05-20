import { defineStore } from 'pinia'


type TabOption = 'garden+display' | 'display+display'
export const usePlannerDisplayConfig = defineStore('plannerDisplayConfig', () => {
  const val = ref<TabOption>('garden+display')

  function set(newVal: TabOption) {
    val.value = newVal
  }

  const get = computed(() => val.value)

  return {
    set,
    get,
  }
})
