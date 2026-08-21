import { defineStore } from 'pinia'
import { useEventListener } from '@vueuse/core'
import { ref, computed } from 'vue'

export const useMouseTracker = defineStore('mouseTracker', () => {
    const leftState = ref(false)
    const middleState = ref(false)
    const rightState = ref(false)
  
    const resetState = () => {
        leftState.value = false
        middleState.value = false
        rightState.value = false
    }
  
    useEventListener('mousedown', (e) => {
        leftState.value = e.button === 0
        middleState.value = e.button === 1
        rightState.value = e.button === 2
    })
  
    useEventListener('mouseup', resetState) 
    
    useEventListener('dragend', resetState)
    useEventListener('drop', resetState)
    
    useEventListener('contextmenu', resetState)
    useEventListener('mouseleave', resetState)

    const left = computed(() => leftState.value)
    const middle = computed(() => middleState.value)
    const right = computed(() => rightState.value)
  
    return { left, middle, right }
})