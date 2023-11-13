import { defineStore } from 'pinia'

export const useSaveCode = defineStore('saveCode', () => {
  const val = ref('')
  const code = computed(() => val.value)
  const set = (newVal: string) => {
    val.value = newVal
  }

  const link = computed(() => {
    return `https://palia-garden-planner.vercel.app/?layout=${val.value}`
  })

  const linkMarkdown = computed(() => {
    return `[Palia Garden Planner](${link.value})`
  })

  return {
    code,
    set,
    link,
    linkMarkdown,
  }
})
