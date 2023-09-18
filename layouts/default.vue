<script setup lang="ts">
useHead({
  title: 'Palia Garden Planner',
})
</script>

<template>
  <div class="flex flex-col max-w-[1920px] mx-auto">
    <PGPHeader />
    <NuxtPage />
    <PGPFooter />
  </div>
</template>
