import { defineStore } from 'pinia'
import Processor, {type  FertiliserCostSource, type GardenData, type ProcessorSetting, type ProcessorSettings } from '~/assets/scripts/garden-planner/classes/processor';

import type { FertiliserType } from '~/assets/scripts/garden-planner/imports'
import { Currency, type ICropName, type ICropNameWithGrowthDiff, type ITotalHarvest } from '~/assets/scripts/garden-planner/utils/garden-helpers'

const useProcessor = defineStore('processor', () => {
  const processorRef = ref(new Processor())
  const settingsRef = ref<ProcessorSettings>({
    cropSettings: new Map<ICropName, ProcessorSetting>(),
    crafterSetting: 0,
    goldAverageSetting: 'crafterTime',
    useFertilserCostSettings: true,
    fertiliserCostSettings: new Map()
  })

  function simulateProcessing(
    totalHarvestData: ITotalHarvest,
    gardenData: GardenData
  ) {
    processorRef.value = new Processor()
    processorRef.value.process(totalHarvestData, settingsRef.value, gardenData)
  }

  function updateSettings(newSettings: ProcessorSettings) {
    settingsRef.value.cropSettings = newSettings.cropSettings
    settingsRef.value.goldAverageSetting = newSettings.goldAverageSetting

    settingsRef.value.useFertilserCostSettings = newSettings.useFertilserCostSettings
    settingsRef.value.fertiliserCostSettings = newSettings.fertiliserCostSettings
  }

  function setCropSetting(id: ICropNameWithGrowthDiff, setting: ProcessorSetting){
    settingsRef.value.cropSettings.set(id, setting)
  }

  function setFertiliserCostSetting(type: FertiliserType, costSource: FertiliserCostSource){
    settingsRef.value.fertiliserCostSettings.set(type, costSource)
  }

  function resetCropSettingsActive(){
    settingsRef.value.cropSettings.forEach((setting, id) => {
      setting.isActive = false
      settings.value.cropSettings.set(id, setting)
    })
  }

  const processor = computed(() => processorRef.value)

  const output = computed(() => processorRef.value.output)

  const fertiliserCostsPerDay = computed(() => {
    let gold = 0
    let medals = 0

    for (const [type, item] of processor.value.fertiliserCostsPerDay){
      if (item.currency === Currency.GOLD) {
        gold += (item.baseGoldValue * item.count)
      } else if (item.currency === Currency.MEDAL){
       medals += (item.baseGoldValue * item.count) 
      }
    }

    return {
      gold,
      medals
    }
  })

  const settings = computed(() => settingsRef.value)

  // ! Kinda just a placeholder whilst I figure out how to better handle the mutation going on here
  const settingsForEncoding = computed(() => {
    return {...settingsRef.value, fertiliserCostSettings: processor.value.activeFertiliserCostSettings}
  })

  const inventory = computed(() => {
    return processorRef.value.inventory
  })

  const finalGoldValue = computed(() => {
    let goldValue = 0

    for (const [, item] of processorRef.value.inventory)
      goldValue += (item.count * item.baseGoldValue)

    if (settings.value.useFertilserCostSettings){
      for (const [type, item] of processorRef.value.fertiliserCostsPerDay){
        if (item.currency !== Currency.GOLD) continue

        const goldToDeduct = ((item.count * item.baseGoldValue) * processorRef.value.lastDayOfHarvest)

        goldValue -= goldToDeduct
      }
    }

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
    setCropSetting,
    resetCropSettingsActive,
    settingsRef,
    settingsForEncoding,
    setFertiliserCostSetting,
    fertiliserCostsPerDay
  }
})

export default useProcessor
