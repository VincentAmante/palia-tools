<script setup lang="ts">
defineProps({
  tooltip: {
    type: String,
    default: '',
    required: false,
  },
  imgSrc: {
    type: String,
    default: '',
  },
  imgAlt: {
    type: String,
    default: '',
    required: false,
  },
  star: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    default: 0,
  },
  baseGoldValue: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <li
    class="relative flex flex-col items-center justify-center rounded-md isolate aspect-square bg-accent dark:bg-palia-blue-secondary"
  >
    <div
      :data-tip="tooltip || `${(count * baseGoldValue).toLocaleString()} Gold`"
      class="z-50 hidden w-full h-full sm:absolute"
      :class="{'sm:tooltip': tooltip || (baseGoldValue !== 0)}"
    />
    <div class="relative w-full h-full p-2 pt-[10px] rounded-md isolate overflow-clip">
      <div class="absolute top-0 left-0 w-full h-full -translate-y-1 rounded-md select-none opacity-40 -z-10 bg-linear-to-b from-misc to-primary dark:from-palia-blue dark:to-water-retain/80" />
      <img
        v-if="imgSrc"
        :src="imgSrc"
        width="32px"
        class="object-contain aspect-square"
        :srcset="undefined"
      >

      <p class="absolute bottom-0 left-0">
        <font-awesome-icon v-if="star" class="text-sm text-quality-increase" :icon="['fas', 'star']" />
      </p>
      <p
        class="absolute top-0 right-0 px-[2px] text-xs font-semibold  text-center align-middle rounded-lg text-palia-blue-dark dark:text-accent"
        :class="(count < 0) ? 'italic bold text-weed-prevention-dark dark:text-growth-boost' : ' '"
      >
        {{ (Math.round(count*100)/100).toLocaleString() }}
      </p>
      <p class="absolute bottom-0 right-1">
        <slot name="icon" />
      </p>
    </div>
  </li>
</template>
