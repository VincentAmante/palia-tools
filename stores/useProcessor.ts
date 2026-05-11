import { defineStore } from 'pinia'
import Processor, { type ProcessorSetting, type ProcessorSettings } from '~/assets/scripts/garden-planner/classes/processor'
import type { ICropName, ITotalHarvest } from '~/assets/scripts/garden-planner/utils/garden-helpers'

const useProcessor = defineStore('processor', () => {
  const processorRef = ref(new Processor())
  const settingsRef = ref<ProcessorSettings>({
    cropSettings: new Map<ICropName, ProcessorSetting>(),
    crafterSetting: 0,
    goldAverageSetting: 'crafterTime'
  })

  function simulateProcessing(
    totalHarvestData: ITotalHarvest,
  ) {
    processorRef.value = new Processor()
    processorRef.value.process(totalHarvestData, settingsRef.value)
  }

  function updateSettings(newSettings: ProcessorSettings) {
    settingsRef.value.cropSettings = newSettings.cropSettings
    settingsRef.value.goldAverageSetting = newSettings.goldAverageSetting
  }

  const processor = computed(() => processorRef.value)

  const output = computed(() => processorRef.value.output)

  const settings = computed(() => settingsRef.value)

  const inventory = computed(() => {
    return processorRef.value.inventory
  })

  const finalGoldValue = computed(() => {
    let goldValue = 0

    for (const [, item] of processorRef.value.inventory)
      goldValue += (item.count * item.baseGoldValue)

    return goldValue
  })

  const highestCraftingTime = computed(() => {
    return processorRef.value.highestCraftingTime
  })

  const averageGoldValue = computed(() => {
    const highestCraftingTimeHours = Math.max(highestCraftingTime.value / 60, 1)
    const average = finalGoldValue.value / highestCraftingTimeHours

    return Math.round(average)
  })

  const seedCollectorsCount = computed(() => {
    return processor.value.seedCollectorsCount
  })

  const preserveJarsCount = computed(() => {
    return processor.value.preserveJarsCount
  })

  const seedCollectors = computed(() => {
    return processor.value.seedCollectors
  })
  const preserveJars = computed(() => {
    return processor.value.preserveJars
  })

  return {
    processor,
    simulateProcessing,
    output,
    settings,
    updateSettings,
    seedCollectorsCount,
    preserveJarsCount,
    highestCraftingTime,
    inventory,
    finalGoldValue,
    averageGoldValue,
    seedCollectors,
    preserveJars,
  }
})

export default useProcessor
