<script setup lang="ts">
useHead({
  title: 'Palia Garden Planner',
})
</script>

<template>
  <div class="flex flex-col max-w-[1680px] mx-auto">
    <div class="-z-10 bg-gradient fixed w-full h-full" />
    <PGPHeader />
    <NuxtPage />
    <PGPFooter />
  </div>
</template>
