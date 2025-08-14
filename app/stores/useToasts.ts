import { defineStore } from 'pinia'
import { ref } from 'vue'
import uniqid from 'uniqid'
export interface Toast {
  message: string
  type: string
  duration: number
  id?: string
}

export const useToasts = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([])

  function addToast(toast: Toast) {
    toasts.value.push({
      ...toast,
      id: uniqid()
    })
  }

  function removeToast(id: string) {
    if (!id) {
      console.error('Toasts', toasts.value)
      throw new Error('toast was created without ID', {
        cause: toasts
      })
    }

    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    addToast,
    removeToast,
  }
})
