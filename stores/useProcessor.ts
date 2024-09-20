import { defineStore } from 'pinia'
import Processor, { type ProcessorSetting, type ProcessorSettings } from '~/assets/scripts/garden-planner/classes/processor'
import type { ICropName, ITotalHarvest } from '~/assets/scripts/garden-planner/utils/garden-helpers'

const useProcessor = defineStore('processor', () => {
  const processorRef = ref(new Processor())
  const settingsRef = ref<ProcessorSettings>({
    cropSettings: new Map<ICropName, ProcessorSetting>(),
    crafterSetting: 0,
  })

  function simulateProcessing(
    totalHarvestData: ITotalHarvest,
  ) {
    processorRef.value = new Processor()
    processorRef.value.process(totalHarvestData, settingsRef.value)
  }

  function updateSettings(newSettings: ProcessorSettings) {
    settingsRef.value = newSettings
  }

  const processor = computed(() => processorRef.value)

  const output = computed(() => processorRef.value.output)

  const settings = computed(() => settingsRef.value)

  return {
    processor,
    simulateProcessing,
    output,
    settings,
    updateSettings,
  }
})

export default useProcessor
