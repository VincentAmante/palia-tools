import { defineStore } from 'pinia'
import type { IHarvesterOptions } from '~/assets/scripts/garden-planner/classes/harvester'
import Harvester from '~/assets/scripts/garden-planner/classes/harvester'
import type { DayHarvests, ITotalHarvest, TUniqueTiles } from '~/assets/scripts/garden-planner/utils/gardenHelpers'

const useHarvester = defineStore('harvester', () => {
  const harvesterRef = ref(new Harvester())

  const _dayHarvests = ref<DayHarvests>(new Map())
  const _totalHarvest = ref<ITotalHarvest>({
    lastHarvestDay: 0,
    crops: new Map(),
    seedsRemainder: new Map(),
    cycleData: new Map(),
  } satisfies ITotalHarvest)


  function simulateYield(
    tiles: TUniqueTiles,
    options: IHarvesterOptions,
  ) {
    const newHarvester = new Harvester()
    newHarvester.simulateYield(tiles, options)

    _dayHarvests.value = newHarvester.dayHarvests
    _totalHarvest.value = newHarvester.totalHarvest

    harvesterRef.value = newHarvester
  }

  const harvester = computed(() => harvesterRef.value)
  const dayHarvests = readonly(_dayHarvests)
  const totalHarvest = readonly(_totalHarvest)

  return {
    harvester,
    simulateYield,
    dayHarvests,
    totalHarvest,
  }
})

export default useHarvester
