<script setup lang="ts">
import HousePlanner from '@/components/house-planner/HousePlanner2.vue'
</script>

<template>
  <div>
    <ClientOnly>
      <HousePlanner />
    </ClientOnly>
  </div>
</template>
