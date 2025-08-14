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
    class="relative justify-start text-sm isolate btn flex-nowrap bg-palia-blue"
    :class="(isActive) ? 'btn-active' : ''"
  >
    <img
      width="128" height="128" :src="src" class="h-full object-contain w-fit"
      :srcset="undefined" :alt="label" format="webp"
    />
    <p class="font-normal normal-case">
      {{ label }}
    </p>
  </button>
</template>
