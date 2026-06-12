<script setup lang="ts">
import useGarden from '~/stores/useGarden'
import { Bonus } from '~/assets/scripts/garden-planner/imports'

const garden = useGardenGrid()
</script>

<template>
  <section id="statsDisplay" class="">
    <h2 class="sr-only">
      Crop Bonus Statistics
    </h2>
    <div
      class="flex gap-[0.35rem] lg:gap-3 xl:gap-4 w-full cursor-help justify-center p-1 xs:bg-primary xs:dark:bg-palia-blue-secondary  rounded-lg xs:p-2">
      <CoverageStat
        :total-crops="garden.analyser.cropCount"
        :covered="garden.analyser.bonusCountsByType['Speed Increase']" class="text-growth-boost"
        @mouseover="garden.setHoveredBonus(Bonus.SpeedIncrease)" @mouseleave="garden.setHoveredBonus(Bonus.None)">
        <template #icon>
          <font-awesome-icon :icon="['fas', 'forward-fast']" />
        </template>
        <template #title>
          Growth Boost
        </template>
      </CoverageStat>

      <CoverageStat
        :total-crops="garden.analyser.cropCount"
        :covered="garden.analyser.bonusCountsByType['Harvest Increase']" class="text-harvest-boost"
        @mouseover="garden.setHoveredBonus(Bonus.HarvestIncrease)" @mouseleave="garden.setHoveredBonus(Bonus.None)">
        <template #icon>
          <font-awesome-icon :icon="['fas', 'wheat-awn']" />
        </template>
        <template #title>
          Harvest Boost
        </template>
      </CoverageStat>

      <CoverageStat
        :total-crops="garden.analyser.cropCount"
        :covered="garden.analyser.bonusCountsByType['Quality Increase']" class="text-quality-increase"
        @mouseover="garden.setHoveredBonus(Bonus.QualityIncrease)" @mouseleave="garden.setHoveredBonus(Bonus.None)">
        <template #icon>
          <font-awesome-icon :icon="['fas', 'star']" />
        </template>
        <template #title>
          Quality Increase
        </template>
      </CoverageStat>

      <CoverageStat
        :total-crops="garden.analyser.cropCount"
        :covered="garden.analyser.bonusCountsByType['Water Retain']" class="text-water-retain"
        @mouseover="garden.setHoveredBonus(Bonus.WaterRetain)" @mouseleave="garden.setHoveredBonus(Bonus.None)">
        <template #icon>
          <font-awesome-icon :icon="['fas', 'droplet']" />
        </template>
        <template #title>
          Water Retain
        </template>
      </CoverageStat>
      <CoverageStat
        :total-crops="garden.analyser.cropCount"
        :covered="garden.analyser.bonusCountsByType['Weed Prevention']" class="text-weed-prevention"
        @mouseover="garden.setHoveredBonus(Bonus.WeedPrevention)" @mouseleave="garden.setHoveredBonus(Bonus.None)">
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
