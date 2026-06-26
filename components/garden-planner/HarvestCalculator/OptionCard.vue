<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  disabled: Boolean,
  useLabel: Boolean
})
</script>

<template>
  <legend v-if="!useLabel" class="fieldset-legend text-sm text-palia-blue dark:text-harvest-boost">
    {{ name }}
  </legend>
  <label v-else class="text-palia-blue font-bold dark:text-water-retain" :for="name">{{ name }}</label>
  <label :for="name" class="label">
    <slot name="input" />
  </label>
  <label :for="name" class="label flex-col gap-px items-start opacity-100 text-palia-blue dark:text-water-retain">
    <slot name="labels" />
  </label>
  <div class="last:hidden my-px divider divider-primary"/>
</template>
