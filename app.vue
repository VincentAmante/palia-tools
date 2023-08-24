<script setup lang="ts">
useServerSeoMeta({
  ogTitle: 'Palia Garden Planner',
  title: 'Palia Garden Planner',
  description: 'A fan-made tool for planning out your garden',
  themeColor: '#e4d8b4',
})

// For Google Search Console

useHead({
  meta: [
    {
      name: 'google-site-verification',
      content: '9aAZNWLR6mEsKgyPLuQphHNC73YjhWXF5z6CMbJTyZA',
    },
  ],
})
</script>

<template>
  <div>
    <NuxtLayout />
  </div>
</template>
