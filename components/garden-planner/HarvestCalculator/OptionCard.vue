<script setup lang="ts">
defineProps({
  label: String,
  name: String,
  disabled: Boolean,
})
</script>

<template>
  <li>
    <label
      :for="label"
      class="flex flex-col justify-start p-2 px-3 rounded-md bg-accent text-misc"
      :class="(disabled) ? 'opacity-50' : ''"
    >
      <div class="grid items-center gap-1 md:grid-cols-2">
        <div>
          <p class="py-1 text-sm font-bold">
            {{ name }}
          </p>

          <div class="text-xs">
            <slot name="labels" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <slot name="input" />
        </div>
      </div>
    </label>
  </li>
</template>
