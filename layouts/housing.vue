<script setup lang="ts">
import HousingHeader from '~/components/house-planner/HousingHeader.vue'

useHead({
  title: 'Palia Housing Planner',
})

useServerSeoMeta({
  ogTitle: 'Palia Housing Planner',
  ogDescription: 'Alpha release of a Palia Housing Planner, from the creator of the Garden Planner',
  ogImage: 'https://palia-garden-planner.vercel.app/housing-logo.webp',
  ogUrl: 'https://palia-garden-planner.vercel.app/housing',
  ogType: 'website',
  ogLocale: 'en_UK',
  title: 'Palia Garden Planner',
  description: 'Alpha release of a Palia Housing Planner, from the creator of the Garden Planner',
  themeColor: '#B2BEFE',
  twitterTitle: 'Palia Housing Planner',
  twitterCard: 'summary',
  twitterDescription: 'Alpha release of a Palia Housing Planner, from the creator of the Garden Planner',
  twitterImage: 'https://palia-garden-planner.vercel.app/housing-logo.webp',
})
</script>

<template>
  <div>
    <div class="-z-10 bg-gradient fixed w-full h-full" />
    <div class="flex flex-col max-w-[1440px] mx-auto">
      <HousingHeader />
      <NuxtPage />
      <PGPFooter />
    </div>
  </div>
</template>
