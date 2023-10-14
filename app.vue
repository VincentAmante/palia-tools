<script setup lang="ts">
useServerSeoMeta({
  ogTitle: 'Palia Garden Planner',
  ogDescription: 'A fan-made tool for planning out your garden. Displays crop and fertiliser bonuses, approximates harvest yield, and provides shareable save codes!',
  ogImage: 'https://palia-garden-planner.vercel.app/logo.webp',
  ogUrl: 'https://palia-garden-planner.vercel.app/',
  ogSiteName: 'Palia Garden Planner',
  ogType: 'website',
  ogLocale: 'en_UK',
  title: 'Palia Garden Planner',
  description: 'A fan-made tool for planning out your garden. Displays crop and fertiliser bonuses, approximates harvest yield, and provides shareable save codes!',
  themeColor: '#97AF51',
  twitterTitle: 'Palia Garden Planner',
  twitterCard: 'summary',
  twitterDescription: 'A fan-made tool for planning out your garden. Displays crop and fertiliser bonuses, approximates harvest yield, and provides shareable save codes!',
  twitterImage: 'https://palia-garden-planner.vercel.app/logo.webp',
})

// For Google Search Console
useHead({
  meta: [
    {
      name: 'google-site-verification',
      content: '9aAZNWLR6mEsKgyPLuQphHNC73YjhWXF5z6CMbJTyZA',
    },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})
</script>

<template>
  <div>
    <NuxtLayout />
  </div>
</template>
