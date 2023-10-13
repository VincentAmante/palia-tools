<script setup lang="ts">
useHead({
  title: 'Palia Garden Planner',
})
</script>

<template>
  <div>
    <div class="-z-10 bg-gradient fixed w-full h-full" />
    <div class="flex flex-col max-w-[1440px] mx-auto">
      <PGPHeader />
      <NuxtPage />
      <PGPFooter />
    </div>
  </div>
</template>
