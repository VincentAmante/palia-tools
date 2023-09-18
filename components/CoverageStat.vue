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
  <div class="coverage-stat flex flex-col items-center justify-center gap-[1px] group">
    <div
      class="radial-progress bg-accent group-hover:bg-white group-hover:bg-opacity-80 transition-all border-4 border-solid border-white border-opacity-0"
      :style="[percent, '--size: clamp(8px, 4rem, 14vw)']"
    >
      <div class="relative flex flex-col text-center items-center justify-center">
        <div class="pt-2 text-lg lg:text-lg flex flex-col items-center justify-center te">
          <slot name="icon" />
        </div>
        <div class="text font-bold text-center flex flex-col items-center justify-center">
          <p class="flex items-center gap-[1px]">
            {{ percentString }}
            <!-- <span class="text-xs">%</span> -->
          </p>
        </div>
      </div>
    </div>
    <div class="capitalise font-bold max-w-[10ch] text-misc text-xs h-12 text-center break-words align-top flex items-start pt-[2px]">
      <slot name="title">
        Title missing
      </slot>
    </div>
  </div>
</template>
