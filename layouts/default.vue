<script setup lang="ts">
useHead({
  title: 'Palia Garden Planner',
  meta: [
    {
    },
  ],
})
</script>

<template>
  <div class="flex flex-col px-2">
    <PGPHeader />
    <NuxtPage />
    <PGPFooter />
  </div>
</template>
