import { defineStore } from 'pinia'
import type { IProcessorOptions } from '~/assets/scripts/garden-planner/classes/processor'
import Processor from '~/assets/scripts/garden-planner/classes/processor'

const useProcessor = defineStore('processor', () => {
  const processorRef = ref(new Processor())

  function simulateProcessing(
    options: IProcessorOptions,
  ) {
    processorRef.value = new Processor()
    processorRef.value.process()
  }

  const processor = computed(() => processorRef.value)

  const output = computed(() => processorRef.value.output)

  return {
    processor,
    simulateProcessing,
    output,
  }
})

export default useProcessor
