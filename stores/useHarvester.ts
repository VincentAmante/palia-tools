import { defineStore } from 'pinia'
import type { IHarvesterOptions } from '~/assets/scripts/garden-planner/classes/harvester'
import Harvester from '~/assets/scripts/garden-planner/classes/harvester'
import type { TUniqueTiles } from '~/assets/scripts/garden-planner/utils/garden-helpers'

const useHarvester = defineStore('harvester', () => {
  const harvesterRef = ref(new Harvester())

  const harvestSettingsRef = ref<IHarvesterOptions>({
    days: 'L',
    includeReplant: true,
    includeReplantCost: true,
    useStarSeeds: true,
    useGrowthBoost: false,
    level: 25,
  })

  function simulateYield(
    tiles: TUniqueTiles,
    options: IHarvesterOptions = harvestSettingsRef.value,
  ) {
    harvesterRef.value = new Harvester()
    harvesterRef.value.simulateYield(tiles, options)
  }

  function updateSettings(newSettings: IHarvesterOptions) {
    harvestSettingsRef.value = { ...newSettings }
  }

  const harvester = computed(() => harvesterRef.value)
  const dayHarvests = computed(() => harvesterRef.value.dayHarvests)
  const totalHarvest = computed(() => harvesterRef.value.totalHarvest)
  const settings = computed(() => harvestSettingsRef.value)

  return {
    harvester,
    simulateYield,
    dayHarvests,
    totalHarvest,
    settings,
    updateSettings,
  }
})

export default useHarvester
