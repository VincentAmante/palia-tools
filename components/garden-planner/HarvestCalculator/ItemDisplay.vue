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
    class="relative flex flex-col items-center justify-center h-full rounded-md isolate aspect-square bg-accent"
  >
    <div
      :data-tip="tooltip || `${count * baseGoldValue}g`"
      class="z-50 hidden w-full h-full sm:absolute sm:tooltip"
    />
    <div class="relative w-full h-full p-2 rounded-md isolate overflow-clip">
      <div class="absolute top-0 left-0 w-full h-full -translate-y-1 rounded-md select-none opacity-40 -z-10 bg-gradient-to-b from-misc to-primary" />
      <img
        v-if="imgSrc"
        :src="imgSrc"
        width="36px"
        class="object-contain aspect-square"
        :srcset="undefined"
      >
      <p
        class="absolute bottom-0 right-0 px-1 text-xs font-semibold text-center align-middle rounded-lg "
        :class="(count < 0) ? 'text-error' : ' text-misc-dark'"
      >
        {{ count }}
      </p>
      <p class="absolute bottom-0 right-1">
        <slot name="icon" />
      </p>
      <p class="absolute bottom-0 left-0">
        <font-awesome-icon v-if="star" class="text-sm text-quality-increase" :icon="['fas', 'star']" />
      </p>
    </div>
  </li>
</template>
