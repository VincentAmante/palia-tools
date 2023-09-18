<script setup lang="ts">
defineProps({
  postLevel25: Boolean,
  allStarSeeds: Boolean,
  includeReplant: Boolean,
  includeReplantCost: Boolean,
  baseChanceStarSeed: Number,
  baseChanceNormalSeed: Number,
})
</script>

<template>
  <div class="font-semibold flex gap-2 text-sm flex-wrap">
    <p class="badge badge-error bg-weed-prevention text-xs">
      {{ (postLevel25) ? 'Lvl. 25+' : 'Pre-lvl. 25' }}
    </p>
    <p class="badge badge-warning bg-quality-increase text-xs">
      {{ (allStarSeeds) ? 'All-star Seeds' : 'Normal Seeds' }}
    </p>

    <p v-if="!(postLevel25) && allStarSeeds" class="badge badge-warning bg-quality-increase text-xs">
      {{ baseChanceStarSeed
      }}% Star Seed
      Quality
    </p>
    <p v-show="(!includeReplant)" class="badge bg-harvest-boost text-xs">
      No Replant
    </p>
    <p v-if="(includeReplantCost && includeReplant)" class="badge badge-success text-xs">
      Incl. Replant
      Costs
    </p>

    <p v-if="!(allStarSeeds)" class="badge bg-harvest-boost text-xs">
      {{ baseChanceNormalSeed }}% Normal Seed
      Quality
    </p>
    <p class="badge badge-warning bg-harvest-boost text-xs">
      No Fertiliser Costs
    </p>
  </div>
</template>
