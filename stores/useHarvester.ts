import { defineStore } from 'pinia'
import type { IHarvesterOptions } from '~/assets/scripts/garden-planner/classes/harvester'
import Harvester from '~/assets/scripts/garden-planner/classes/harvester'
import type { TUniqueTiles } from '~/assets/scripts/garden-planner/utils/garden-helpers'

const useHarvester = defineStore('harvester', () => {
  const harvesterRef = ref(new Harvester())

  function simulateYield(
    tiles: TUniqueTiles,
    options: IHarvesterOptions,
  ) {
    harvesterRef.value = new Harvester()
    harvesterRef.value.simulateYield(tiles, options)
  }

  const harvester = computed(() => harvesterRef.value)
  const dayHarvests = computed(() => harvesterRef.value.dayHarvests)
  const totalHarvest = computed(() => harvesterRef.value.totalHarvest)

  return {
    harvester,
    simulateYield,
    dayHarvests,
    totalHarvest,
  }
})

export default useHarvester
