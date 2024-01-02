<script setup lang="ts">
defineProps({
  label: String,
  name: String,
  disabled: Boolean,
})
</script>

<template>
  <label
    :for="label"
    class="flex flex-col justify-start p-2 px-3 rounded-md bg-accent text-misc"
    :class="(disabled) ? 'opacity-50' : ''"
  >
    <div class="flex flex-col items-center gap-1 text-center">
      <p class="py-1 font-bold">
        {{ name }}
      </p>
      <div class="flex items-center gap-2">
        <slot name="input" />
      </div>
      <div class="max-w-xs text-xs">
        <slot name="labels" />
      </div>
    </div>
  </label>
</template>
