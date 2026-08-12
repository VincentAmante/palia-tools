import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { IHarvesterOptions } from '~/assets/scripts/garden-planner/classes/harvester'

export const useHarvesterSettings = defineStore('harvesterSettings', () => {
  const settings = reactive<IHarvesterOptions>({
    days: -1,
    includeReplant: true,
    includeReplantCost: true,
    useStarSeeds: true,
    useGrowthBoost: false,
    level: 0,
  })

  function updateSettings(newSettings: Partial<IHarvesterOptions>) {
    Object.assign(settings, newSettings)
  }

  return {
    settings,
    updateSettings
  }
})