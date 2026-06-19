import { defineStore } from 'pinia'
import type { PlotStat } from '~/assets/scripts/garden-planner/imports'
import { Bonus, Garden } from '~/assets/scripts/garden-planner/imports'

const useGarden = defineStore('garden', () => {
  const gardenRef = ref(new Garden())
  const hoveredBonus = ref(Bonus.None)

  function update() {
    gardenRef.value.calculateBonuses()
  }

  function setHoveredBonus(bonus: Bonus) {
    hoveredBonus.value = bonus
  }
  const getHoveredBonus = computed(() => hoveredBonus.value)

  const plotStat = computed(() => gardenRef.value.calculateStats() as PlotStat)

  const cropGropBonusStats = computed(() => gardenRef.value.cropGroupBonusStats)

  const isGardenWide = computed(() => (gardenRef.value.plots[0]?.length || 0) > 3)

  const garden = computed(() => gardenRef.value)

  
  const isFullUpdateRequestedVal = ref(false)
  function requestFullUpdate(){
    isFullUpdateRequestedVal.value = true
  }

  function resetRequestFullUpdate() {
    isFullUpdateRequestedVal.value = false
  }

  const isFullUpdateRequested = computed(() => isFullUpdateRequestedVal.value)

  return {
    garden,
    update,
    plotStat,
    isGardenWide,
    setHoveredBonus,
    getHoveredBonus,
    requestFullUpdate,
    resetRequestFullUpdate,
    isFullUpdateRequested,
    cropGropBonusStats
  }
})

export default useGarden
