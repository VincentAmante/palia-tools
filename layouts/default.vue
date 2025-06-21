<script setup lang="ts">

useHead({
  title: 'Palia Garden Planner',
  script: [{
    innerHTML: `
      (function() {
        const savedSettings = localStorage.getItem('ui-settings');
        let theme = 'system';
        
        const mainPage = document.documentElement;
        
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)

          theme = settings.colorScheme;

        } else {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark' : 'light';
        }
        
        if (theme === 'dark'){
          mainPage.classList.add('dark');
        } else if (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          mainPage.classList.add('dark');
        }
        
        mainPage.classList.add('no-transition');

        window.addEventListener('DOMContentLoaded', () => {
          mainPage.classList.remove('no-transition');
        });
      })();
    `,
    type: 'text/javascript',
    tagPriority: 'critical'
  }]
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
