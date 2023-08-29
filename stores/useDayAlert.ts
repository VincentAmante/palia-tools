import { defineStore } from 'pinia'

export const useDayAlert = defineStore('dayAlert', () => {
  const val = ref(false)

  if (localStorage.getItem('dayAlert') === 'true')
    val.value = true

  function set(newVal: boolean) {
    val.value = newVal
    localStorage.setItem('dayAlert', `${newVal}`)
  }

  const get = computed(() => val.value)

  return {
    set,
    get,
  }
},
)
