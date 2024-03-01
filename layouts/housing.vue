<script setup lang="ts">
import HousingHeader from '~/components/house-planner/HousingHeader.vue'

useHead({
  title: 'Palia House Planner',
  link: [
    {
      rel: 'icon',
      href: '/housing-logo.webp',
    },
  ],
  meta: [
    {
      name: 'description',
      content: 'Alpha release of a Palia Housing Planner, from the creator of the Garden Planner',
    },
    {
      name: 'theme-color',
      content: '#B2BEFE',
    },
    {
      name: 'twitter:card',
      content: 'summary',
    },
    {
      name: 'twitter:title',
      content: 'Palia Housing Planner',
    },
    {
      name: 'twitter:description',
      content: 'Alpha release of a Palia Housing Planner, from the creator of the Garden Planner',
    },
    {
      name: 'twitter:image',
      content: 'https://palia-garden-planner.vercel.app/housing-logo.webp',
    },
    {
      name: 'twitter:image:alt',
      content: 'Palia Housing Planner Logo',
    },
    {
      name: 'og:title',
      content: 'Palia Housing Planner',
    },
    {
      name: 'og:description',
      content: 'Alpha release of a Palia Housing Planner, from the creator of the Garden Planner',
    },
    {
      name: 'og:image',
      content: 'https://palia-garden-planner.vercel.app/housing-logo.webp',
    },
    {
      name: 'og:image:alt',
      content: 'Palia Housing Planner Logo',
    },
    {
      name: 'og:url',
      content: 'https://palia-garden-planner.vercel.app/housing',
    },
    {
      name: 'og:type',
      content: 'website',
    },
    {
      name: 'og:locale',
      content: 'en_UK',
    },
  ],
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
