<script setup lang="ts">
defineProps({
  tooltip: {
    type: String,
    default: '',
  },
  imgSrc: {
    type: String,
    default: '',
  },
  star: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center h-full p-1 isolate aspect-square"
  >
    <div
      :data-tip="tooltip"
      class="z-50 hidden w-full h-full sm:absolute sm:tooltip"
    />
    <nuxt-img
      v-if="imgSrc"
      :src="imgSrc"
      width="36px"
      class="object-contain aspect-square"
      :srcset="undefined"
      placeholder
    />
    <p
      class="absolute top-0 right-0 text-xs p-[1px] px-[6px] text-center align-middle rounded-lg text-accent"
      :class="(amount < 0) ? 'bg-error bg-opacity-70' : 'bg-neutral bg-opacity-40'"
    >
      {{ amount }}
    </p>
    <p class="absolute bottom-0 right-1">
      <slot name="icon" />
    </p>
    <p class="absolute bottom-0 left-0">
      <font-awesome-icon v-if="star" class="text-sm text-quality-increase" :icon="['fas', 'star']" />
    </p>
  </div>
</template>
