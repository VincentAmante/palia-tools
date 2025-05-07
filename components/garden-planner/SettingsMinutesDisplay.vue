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
  <p class="text-xs text-palia-blue-dark">
    <font-awesome-icon :icon="['fas', 'stopwatch']" />
    <span>
      {{ hours }}<span aria-label="Hours">Hrs</span>
      {{ minutes }}<span aria-label="Minutes">Min</span>
    </span>
  </p>
</template>
