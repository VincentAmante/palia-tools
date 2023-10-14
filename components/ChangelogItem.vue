<script setup lang="ts">
defineProps({
  checked: {
    type: Boolean,
    required: false,
  },
})
</script>

<template>
  <articles class="collapse collapse-arrow max-w-3xl py-1 bg-palia-dark-blue text-accent rounded-md  border-[1px] border-opacity-50 border-accent">
    <input type="checkbox" name="changelog" :checked="checked">
    <h2 class="collapse-title text-xl">
      <slot name="title" required>
        Title missing
      </slot>
    </h2>
    <div class="collapse-content flex flex-col gap-4 text-sm md:text-base leading-6">
      <div class="p-4 px-6 bg-palia-blue rounded-lg grid gap-2">
        <h3 class="font-bold text-lg">
          Changes Summary
        </h3>
        <ul class="list-disc list-inside">
          <slot name="summary" required>
            <li>Summary missing</li>
          </slot>
        </ul>
      </div>
      <div class="flex flex-col gap-2 font-light">
        <slot />
      </div>
    </div>
  </articles>
</template>
