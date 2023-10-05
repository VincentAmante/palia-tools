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
    class="rounded-md p-2 px-3 bg-accent text-misc"
    :class="(disabled) ? 'opacity-50' : ''"
  >
    <div class="grid gap-1">
      <p class="py-1 font-bold">
        {{ name }}
      </p>
      <div class="flex gap-2 items-center">
        <slot name="input" />
      </div>
      <div class="text-xs max-w-xs">
        <slot name="labels" />
      </div>
    </div>
  </label>
</template>
