<script setup lang="ts">
const props = defineProps({
  minutes: {
    type: Number,
    default: 0,
  },
})

const hours = computed(() => {
  return Math.floor(props.minutes / 60)
})
const minutes = computed(() => {
  return Math.floor(props.minutes % 60)
})
</script>

<template>
  <p class="text-xs">
    {{ hours }}<span>Hrs</span>
    {{ minutes }}<span>Min</span>
  </p>
</template>
