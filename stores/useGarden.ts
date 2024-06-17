import { defineStore } from 'pinia'
import type { PlotStat } from '~/assets/scripts/garden-planner/imports'
import { Garden } from '~/assets/scripts/garden-planner/imports'

const useGarden = defineStore('garden', () => {
  const garden = new Garden()

  function update() {
    garden.calculateBonuses()
  }

  const plotStat = computed(() => ({ ...garden.calculateStats() } as PlotStat))

  return {
    garden,
    update,
    plotStat,
  }
})

export default useGarden
