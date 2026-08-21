import { defineStore } from 'pinia'
import Processor, { type GardenData } from '~/assets/scripts/garden-planner/classes/processor';

import type { ITotalHarvest } from '~/assets/scripts/garden-planner/types/gardenSimulatorTypes'
import { Currency } from '~/assets/scripts/garden-planner/enums/currency';
import { useProcessorSettings } from './useProcessorSettings';


const useProcessor = defineStore('processor', () => {
  const processorRef = shallowRef(new Processor())

  const settingsStore = useProcessorSettings()


  function simulateProcessing(
    totalHarvestData: Readonly<ITotalHarvest> | ITotalHarvest,
    gardenData: GardenData
  ){
    const newProcessor = new Processor()
    newProcessor.process(totalHarvestData, settingsStore.settings, gardenData)

    processorRef.value = newProcessor
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

  // ! Kinda just a placeholder whilst I figure out how to better handle the mutation going on here
  const settingsForEncoding = computed(() => {
    return {...settingsStore.settings, fertiliserCostSettings: processor.value.activeFertiliserCostSettings}
  })

  const inventory = computed(() => {
    return processorRef.value.inventory
  })

  const totalProduceGold = computed(() => {
    let goldValue = 0

    for (const [, item] of processorRef.value.inventory)
      goldValue += (item.count * item.baseGoldValue)

    return goldValue
  })

  const finalGoldValue = computed(() => {
    let goldValue = totalProduceGold.value

    if (settingsStore.settings.useFertilserCostSettings){
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
    seedCollectorsCount,
    preserveJarsCount,
    highestCraftingTime,
    inventory,
    finalGoldValue,
    averageGoldValue,
    seedCollectors,
    preserveJars,
    settingsForEncoding,
    fertiliserCostsPerDay,
    totalProduceGold
  }
})

export default useProcessor
