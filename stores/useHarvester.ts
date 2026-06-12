import { defineStore } from 'pinia'
import type { IHarvesterOptions } from '~/assets/scripts/garden-planner/classes/harvester'
import Harvester from '~/assets/scripts/garden-planner/classes/harvester'
import type { TUniqueTiles } from '~/assets/scripts/garden-planner/utils/garden-helpers'

const useHarvester = defineStore('harvester', () => {
  const harvesterRef = ref(new Harvester())
  
  const harvestSettingsRef = ref<IHarvesterOptions>({
    days: -1,
    includeReplant: true,
    includeReplantCost: true,
    useStarSeeds: true,
    useGrowthBoost: false,
    level: 0,
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

  function updateSetting(newSettings: { [property in keyof IHarvesterOptions]?: IHarvesterOptions[property] }) {
    harvestSettingsRef.value = { ...harvestSettingsRef.value, ...newSettings }
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
    updateSetting
  }
})

export default useHarvester
