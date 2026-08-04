<script setup lang="ts">

useSeoMeta({
  // Base SEO
  title: 'Palia Garden Planner',
  description:
    'Fan-made tool to plan out your Palia garden layout. View crop and fertilizer bonuses, get approxiomate harvest & gold yields, and share it with our shareable save codes!',
  keywords:
    'Palia garden planner, Palia farming calculator, Palia crop layout, Palia gold yield calculator, Palia fertilizer guide, Palia layout planner, Palia garden creator,',
  ogSiteName: 'Palia Garden Planner',
  ogTitle: 'Palia Garden Planner',
  ogDescription:
    'Fan-made tool to design crop layouts, maximize bonus coverage, calculate harvest yields, and generate shareable garden codes.',
  ogType: 'website',
  ogUrl: 'https://palia-garden-planner.vercel.app/',
  ogLocale: 'en_GB',
  ogImage: 'https://pgp-cdn.b-cdn.net/summary-large.webp',
  ogImageAlt: 'Palia Garden Planner interface preview',
  ogImageWidth: 1200,
  ogImageHeight: 630,

  // Discord
  twitterCard: 'summary',
  twitterTitle: 'Palia Garden Planner | Fan-made Layout Tool',
  twitterDescription:
    'A fan-made tool for designing your garden layouts; get harvest and potential gold yields, and create shareable layout codes.',
  twitterImage: 'https://pgp-cdn.b-cdn.net/logo.webp',

  themeColor: '#97AF51',
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
  link: [
    {
      rel: 'icon', type: 'image/x-icon', href: 'https://pgp-cdn.b-cdn.net/favicon.ico'
    }
  ]
})
</script>

<template>
  <div>
    <NuxtLayout />
  </div>
</template>
