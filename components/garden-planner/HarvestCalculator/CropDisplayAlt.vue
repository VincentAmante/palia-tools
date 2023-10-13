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
    :data-tip="tooltip"
  >
    <div class="relative h-full aspect-square p-2 flex flex-col items-center justify-center">
      <nuxt-img
        v-if="imgSrc"
        :src="imgSrc"
        class="max-w-[2rem] object-contain aspect-square"
      />
      <p
        class="absolute top-0 right-0 text-xs p-[1px] px-[6px] text-center align-middle rounded-lg text-accent"
        :class="(amount < 0) ? 'bg-error bg-opacity-70' : 'bg-neutral bg-opacity-40'"
      >
        {{ amount }}
      </p>
      <p class="absolute bottom-0 right-0">
        <slot name="icon" />
      </p>
      <p class="absolute bottom-0 left-0">
        <font-awesome-icon v-if="star" class="text-quality-increase text-sm" :icon="['fas', 'star']" />
      </p>
    </div>
  </div>
</template>
