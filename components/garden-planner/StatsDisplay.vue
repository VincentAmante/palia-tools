<script setup lang="ts">
import type { PlotStat } from 'assets/scripts/garden-planner/imports'
import { Bonus } from 'assets/scripts/garden-planner/imports'

defineProps<{
  gardenTilesAreWide: boolean
  plotStatTotal: PlotStat
  hoveredBonus: Bonus
}>()

const emit = defineEmits(['update:hoveredBonus'])

const statsDisplay = ref<HTMLDivElement | null>(null)
function getStatsDisplay() {
  return statsDisplay.value
}

function modifyStatsDisplayClassList(callback: (classList: DOMTokenList) => void) {
  const statsDisplay = getStatsDisplay()
  if (statsDisplay)
    callback(statsDisplay.classList)
}

function updateHoveredBonus(bonus: Bonus) {
  emit('update:hoveredBonus', bonus)
}

defineExpose({
  getStatsDisplay,
  modifyStatsDisplayClassList,
})
</script>

<template>
  <div class="px-1 pt-4 md:pt-0 md:px-2 w-full">
    <div
      ref="statsDisplay" class="flex gap-0 md:gap-1 lg:gap-3 xl:gap-4 w-full  md:px-4 cursor-help justify-center"
    >
      <CoverageStat
        :total-crops="plotStatTotal.cropCount"
        :covered="plotStatTotal.cropBonusCoverage['Quality Increase']" class="text-quality-increase"
        @mouseover="updateHoveredBonus(Bonus.QualityIncrease)" @mouseleave="updateHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'star']" />
        </template>
        <template #title>
          Quality Increase
        </template>
      </CoverageStat>

      <CoverageStat
        :total-crops="plotStatTotal.cropCount"
        :covered="plotStatTotal.cropBonusCoverage['Harvest Increase']" class="text-harvest-boost"
        @mouseover="updateHoveredBonus(Bonus.HarvestIncrease)" @mouseleave="updateHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'wheat-awn']" />
        </template>
        <template #title>
          Harvest Boost
        </template>
      </CoverageStat>
      <CoverageStat
        :total-crops="plotStatTotal.cropCount"
        :covered="plotStatTotal.cropBonusCoverage['Water Retain']" class="text-water-retain"
        @mouseover="updateHoveredBonus(Bonus.WaterRetain)" @mouseleave="updateHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'droplet']" />
        </template>
        <template #title>
          Water Retain
        </template>
      </CoverageStat>
      <CoverageStat
        :total-crops="plotStatTotal.cropCount"
        :covered="plotStatTotal.cropBonusCoverage['Speed Increase']" class="text-growth-boost"
        @mouseover="updateHoveredBonus(Bonus.SpeedIncrease)" @mouseleave="updateHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'forward-fast']" />
        </template>
        <template #title>
          Growth Boost
        </template>
      </CoverageStat>

      <CoverageStat
        :total-crops="plotStatTotal.cropCount"
        :covered="plotStatTotal.cropBonusCoverage['Weed Prevention']" class="text-weed-prevention"
        @mouseover="updateHoveredBonus(Bonus.WeedPrevention)" @mouseleave="updateHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'shield']" />
        </template>
        <template #title>
          Weed Prevention
        </template>
      </CoverageStat>
    </div>
  </div>
</template>
