<script setup lang="ts">
import { formatMinutesToDaysHoursMinutesObject } from '~/utils/formatters' // Assuming a formatter utility exists or needs creation


const props = defineProps({
  minutes: {
    type: Number,
    default: 0,
  },
})

const timeFormatted = computed(() => {
  return formatMinutesToDaysHoursMinutesObject(props.minutes)
})
</script>

<template>
  <span class="text-xs text-palia-blue-dark">
    <font-awesome-icon :icon="['fas', 'stopwatch']" />
    <span class="pl-1">
      <template v-if="timeFormatted.days > 0">{{ timeFormatted.days.toLocaleString() }}Days

      </template>
      {{ timeFormatted.hours.toLocaleString() }}<span aria-label="Hours">Hrs</span>
      {{ timeFormatted.minutes.toLocaleString() }}<span aria-label="Minutes">Min</span>
    </span>
  </span>
</template>
