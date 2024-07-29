<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  totalCrops: {
    type: Number,
    required: true,
  },
  covered: {
    type: Number,
    required: true,
  },
  color: String,
})

const percent = computed(() => {
  if (props.totalCrops === 0)
    return '--value:0'

  return `--value:${(props.covered / props.totalCrops) * 100}`
})

const percentString = computed(() => {
  if (props.totalCrops === 0)
    return '0'

  return `${((props.covered / props.totalCrops) * 100).toFixed(0)}`
})
</script>

<template>
  <div class="coverage-stat flex flex-col items-center  gap-[1px] group relative">
    <div
      class="absolute top-0 transition-all border-4 border-white border-opacity-0 border-solid radial-progress bg-accent text-primary group-hover:bg-white group-hover:bg-opacity-80"
      :style="['--value:100', '--size: clamp(8px, 3.7rem, 17vw)']"
    />
    <div
      class="transition-all border-4 border-white border-opacity-0 border-solid radial-progress"
      :style="[percent, '--size: clamp(8px, 3.7rem, 17vw)']"
    >
      <div class="relative flex flex-col gap-[0px] pt-1">
        <div class="flex flex-col items-center justify-center text">
          <slot name="icon" />
        </div>
        <div class="flex flex-col items-center justify-center text-sm font-bold text-center">
          <p class="flex items-center gap-[1px]">
            {{ percentString }}
          </p>
        </div>
      </div>
    </div>
    <div class="capitalise font-bold max-w-[8ch] text-misc text-xs h-fit text-center break-words align-top flex items-start pt-[2px]">
      <slot name="title">
        Title missing
      </slot>
    </div>
  </div>
</template>
