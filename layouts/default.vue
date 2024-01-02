<script setup lang="ts">
useHead({
  title: 'Palia Garden Planner',
})
</script>

<template>
  <div>
    <div class="fixed w-full h-full -z-10 bg-gradient" />
    <div class="flex flex-col max-w-[1440px] mx-auto overflow-x-hidden">
      <PGPHeader />
      <NuxtPage />
      <PGPFooter />
    </div>
  </div>
</template>
