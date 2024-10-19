import { defineStore } from 'pinia'
import Processor, { type ProcessorSetting, type ProcessorSettings } from '~/assets/scripts/garden-planner/classes/processor'
import type { CropType } from '~/assets/scripts/garden-planner/imports'
import { type ICropName, type ITotalHarvest, ItemType } from '~/assets/scripts/garden-planner/utils/garden-helpers'

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
    settingsRef.value.cropSettings = newSettings.cropSettings
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
    let newSeedCollectorsCount = 0
    const seedCollectorsList = new Map<ICropName, {
      cropType: CropType
      crafters: number
      isStar: boolean
    }>()

    for (const [cropName, setting] of settingsRef.value.cropSettings) {
      if (setting.processAs === ItemType.Seed && setting.isActive) {
        newSeedCollectorsCount += setting.crafters
        seedCollectorsList.set(cropName, {
          cropType: setting.cropType,
          crafters: setting.crafters,
          isStar: setting.isStar,
        })
      }
    }

    return newSeedCollectorsCount
  })

  const preserveJarsCount = computed(() => {
    const preserveJarsList = new Map<ICropName, {
      cropType: CropType
      crafters: number
      isStar: boolean
    }>()

    let newPreserveJarsCount = 0
    for (const [cropName, setting] of settingsRef.value.cropSettings) {
      if (setting.processAs === ItemType.Preserve && setting.isActive) {
        newPreserveJarsCount += setting.crafters
        preserveJarsList.set(cropName, {
          cropType: setting.cropType,
          crafters: setting.crafters,
          isStar: setting.isStar,
        })
      }
    }

    return newPreserveJarsCount
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
  }
})

export default useProcessor
