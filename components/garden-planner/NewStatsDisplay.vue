<script setup lang="ts">
import useGarden from '~/stores/useGarden'
import { Bonus } from '~/assets/scripts/garden-planner/imports'

const gardenHandler = useGarden()

const plotStat = computed(() => gardenHandler.plotStat)
</script>

<template>
  <section id="statsDisplay" class="">
    <h2 class="sr-only">
      Crop Bonus Statistics
    </h2>
    <div class="flex gap-[0.35rem] lg:gap-3 xl:gap-4 w-full cursor-help justify-center p-1 xs:bg-primary rounded-lg xs:p-2">
      <CoverageStat
        :total-crops="plotStat.cropCount"
        :covered="plotStat.cropBonusCoverage['Speed Increase']" class="text-growth-boost"
        @mouseover="gardenHandler.setHoveredBonus(Bonus.SpeedIncrease)"
        @mouseleave="gardenHandler.setHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'forward-fast']" />
        </template>
        <template #title>
          Growth Boost
        </template>
      </CoverageStat>

      <CoverageStat
        :total-crops="plotStat.cropCount"
        :covered="plotStat.cropBonusCoverage['Harvest Increase']" class="text-harvest-boost"
        @mouseover="gardenHandler.setHoveredBonus(Bonus.HarvestIncrease)"
        @mouseleave="gardenHandler.setHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'wheat-awn']" />
        </template>
        <template #title>
          Harvest Boost
        </template>
      </CoverageStat>

      <CoverageStat
        :total-crops="plotStat.cropCount"
        :covered="plotStat.cropBonusCoverage['Quality Increase']" class="text-quality-increase"
        @mouseover="gardenHandler.setHoveredBonus(Bonus.QualityIncrease)"
        @mouseleave="gardenHandler.setHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'star']" />
        </template>
        <template #title>
          Quality Increase
        </template>
      </CoverageStat>

      <CoverageStat
        :total-crops="plotStat.cropCount"
        :covered="plotStat.cropBonusCoverage['Water Retain']" class="text-water-retain"
        @mouseover="gardenHandler.setHoveredBonus(Bonus.WaterRetain)"
        @mouseleave="gardenHandler.setHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'droplet']" />
        </template>
        <template #title>
          Water Retain
        </template>
      </CoverageStat>
      <CoverageStat
        :total-crops="plotStat.cropCount"
        :covered="plotStat.cropBonusCoverage['Weed Prevention']" class="text-weed-prevention"
        @mouseover="gardenHandler.setHoveredBonus(Bonus.WeedPrevention)"
        @mouseleave="gardenHandler.setHoveredBonus(Bonus.None)"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'shield']" />
        </template>
        <template #title>
          Weed Prevention
        </template>
      </CoverageStat>
    </div>
  </section>
</template>
