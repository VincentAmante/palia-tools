<script setup lang="ts">
import type { PlotStat } from 'assets/scripts/garden-planner/imports'
import { Bonus } from 'assets/scripts/garden-planner/imports'

defineProps<{
  gardenTilesAreWide: boolean
  plotStatTotal: PlotStat
  hoveredBonus: Bonus
}>()

defineEmits(['update:hoveredBonus'])

const statsDisplay = ref<HTMLDivElement | null>(null)
function getStatsDisplay() {
  return statsDisplay.value
}

defineExpose({
  getStatsDisplay,
})
</script>

<template>
  <div class="my-2 px-2 w-fit">
    <div
      ref="statsDisplay" class="flex flex-wrap gap-2 w-fit px-4 mt-4 cursor-help"
      :class="(gardenTilesAreWide) ? '' : 'lg:grid lg:grid-cols-2'"
    >
      <CoverageStat
        :total-crops="plotStatTotal.cropCount"
        :covered="plotStatTotal.cropBonusCoverage['Quality Increase']" class="text-amber-600"
        @mouseover="hoveredBonus = Bonus.QualityIncrease" @mouseleave="hoveredBonus = Bonus.None"
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
        :covered="plotStatTotal.cropBonusCoverage['Harvest Increase']" class="text-green-600"
        @mouseover="hoveredBonus = Bonus.HarvestIncrease" @mouseleave="hoveredBonus = Bonus.None"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'wheat-awn']" />
        </template>
        <template #title>
          Harvest Increase
        </template>
      </CoverageStat>
      <CoverageStat
        :total-crops="plotStatTotal.cropCount"
        :covered="plotStatTotal.cropBonusCoverage['Water Retain']" class="text-sky-500"
        @mouseover="hoveredBonus = Bonus.WaterRetain" @mouseleave="hoveredBonus = Bonus.None"
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
        :covered="plotStatTotal.cropBonusCoverage['Speed Increase']" class="text-orange-400"
        @mouseover="hoveredBonus = Bonus.SpeedIncrease" @mouseleave="hoveredBonus = Bonus.None"
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
        :covered="plotStatTotal.cropBonusCoverage['Weed Prevention']" class="text-rose-400"
        @mouseover="hoveredBonus = Bonus.WeedPrevention" @mouseleave="hoveredBonus = Bonus.None"
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
