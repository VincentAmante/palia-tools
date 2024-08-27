<script setup lang="ts">
defineProps({
  checked: {
    type: Boolean,
    required: false,
  },
})
</script>

<template>
  <article class="collapse collapse-arrow max-w-3xl py-1 bg-palia-blue-dark text-accent rounded-md  border-[1px] border-opacity-50 border-accent">
    <input type="checkbox" name="changelog" :checked="checked">
    <h2 class="text-xl collapse-title">
      <slot name="title" required>
        Title missing
      </slot>
    </h2>
    <div class="flex flex-col gap-4 text-sm leading-6 collapse-content md:text-base">
      <div class="grid gap-2 p-4 px-6 rounded-lg bg-palia-blue">
        <h3 class="text-lg font-bold">
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
  </article>
</template>
