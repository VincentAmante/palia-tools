<script setup lang="ts">
defineProps({
  label: String,
  src: String,
  isActive: Boolean,
})
</script>

<template>
  <button
    :aria-label="label"
    class="relative isolate btn justify-start text-sm flex-nowrap"
    :class="(isActive) ? 'btn-active' : ''"
  >
    <NuxtImg
      width="128" height="128" :src="src" class="w-full max-w-[2.5rem]"
      :srcset="undefined" placeholder :alt="label" format="webp"
    />
    <p class="normal-case font-normal">
      {{ label }}
    </p>
  </button>
</template>
