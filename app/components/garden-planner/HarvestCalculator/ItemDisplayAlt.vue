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
    class="relative flex flex-col items-center justify-center w-10 h-10 rounded-sm isolate aspect-square bg-accent dark:bg-palia-blue-secondary dark:border-water-retain/60 dark:border"
  >
    <!-- <div
      :data-tip="tooltip || `${count * baseGoldValue}g`"
      class="z-50 hidden w-full h-full sm:absolute sm:tooltip"
    /> -->
    <div class="relative w-full h-full p-2 isolate overflow-clip">
      <div class="absolute top-0 left-0 w-full h-full select-none opacity-40 -z-10 bg-linear-to-b from-misc to-primary dark:from-palia-blue dark:to-water-retain/80 " />
      <img
        v-if="imgSrc"
        :src="imgSrc"
        width="28px"
        class="object-contain aspect-square pt-0.5"
        :srcset="undefined"
      >

      <p class="absolute bottom-0 left-0">
        <font-awesome-icon v-if="star" class="text-sm text-quality-increase" :icon="['fas', 'star']" />
      </p>
      <p
        v-if="count !== 0"
        class="absolute top-0 right-0 px-[2px] text-xs text-center align-middle rounded-lg"
        :class="[(count < 0) ? 'font-bold italic dark:text-growth-boost' : ' text-palia-blue-dark dark:text-accent',
          (count.toLocaleString().length > 5 ? 'text-xxs' : 'text-xs')
        ]"
      >
        {{ count.toLocaleString() }}
      </p>
      <p class="absolute bottom-0 right-1">
        <slot name="icon" />
      </p>
    </div>
  </li>
</template>
