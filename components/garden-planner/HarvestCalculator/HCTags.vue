<script setup lang="ts">
defineProps({
  postLevel25: Boolean,
  allStarSeeds: Boolean,
  includeReplant: Boolean,
  includeReplantCost: Boolean,
  baseChanceStarSeed: Number,
  baseChanceNormalSeed: Number,
  useGrowthBoost: Boolean,
})
</script>

<template>
  <div class="flex gap-1 py-[0.5rem] md:py-[0.3rem] text-sm flex-wrap">
    <p class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-weed-prevention text-xs">
      {{ (postLevel25) ? 'Lvl. 25+' : 'Pre-lvl. 25' }}
    </p>
    <p v-show="useGrowthBoost" class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-growth-boost text-xs ">
      <font-awesome-icon :icon="['fas', 'forward-fast']" class="mr-1" />
      Growth Boost
    </p>
    <p class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-quality-increase-dark text-xs ">
      {{ (allStarSeeds) ? 'Star Seeds' : 'Normal Seeds' }}
    </p>
    <p v-if="!(postLevel25) && allStarSeeds" class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-quality-increase-dark text-xs ">
      {{ baseChanceStarSeed
      }}% Star Chance
    </p>

    <p v-show="(!includeReplant)" class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-harvest-boost-dark text-xs">
      No Replant
    </p>
    <p v-if="(includeReplantCost && includeReplant)" class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-harvest-boost-dark text-xs">
      -Replant
      Costs
    </p>
    <p v-else-if="(includeReplant)" class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-harvest-boost-dark text-xs">
      No Replant Costs
    </p>

    <p v-if="!(allStarSeeds)" class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-harvest-boost-dark text-xs">
      {{ baseChanceNormalSeed }}% Star Chance
    </p>
    <p class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-harvest-boost-dark text-xs">
      No Fertiliser Costs
    </p>
  </div>
</template>
