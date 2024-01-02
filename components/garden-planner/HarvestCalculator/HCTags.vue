<script setup lang="ts">
const props = defineProps({
  useStarSeeds: Boolean,
  includeReplant: Boolean,
  includeReplantCost: Boolean,
  useGrowthBoost: Boolean,
  level: Number,
})

const baseStarChance = computed(() => {
  return Math.min(1, 0.25 + ((props.level ?? 0) * 0.02) + (props.useStarSeeds ? 0.25 : 0))
})
</script>

<template>
  <div class="flex gap-1 py-[0.5rem] md:py-[0.3rem] text-sm flex-wrap">
    <p class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-weed-prevention text-xs">
      Level {{ level }}+
    </p>
    <p v-show="useGrowthBoost" class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-growth-boost text-xs ">
      <font-awesome-icon :icon="['fas', 'forward-fast']" class="mr-1" />
      Growth Boost
    </p>
    <p class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-quality-increase-dark text-xs ">
      {{ (useStarSeeds) ? 'Star Seeds' : 'Normal Seeds' }}
    </p>
    <p class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-quality-increase-dark text-xs ">
      {{ baseStarChance * 100 }}% Star Crop Chance
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
    <p class="py-[0.1rem] px-3 rounded-lg text-center flex items-center bg-harvest-boost-dark text-xs">
      No Fertiliser Costs
    </p>
  </div>
</template>
