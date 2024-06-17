<script setup lang="ts">
useHead({
  title: 'New Page',
  meta: [
    {
      name: 'description',
      content: 'This is a new page',
    },
  ],
})
</script>

<template>
  <main class="flex flex-col gap-4 py-2">
    <h1 class="sr-only">
      Garden Planner
    </h1>
    <GuideCard />
    <GardenPlanner />
  </main>
</template>
