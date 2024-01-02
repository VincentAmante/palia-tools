<script setup lang="ts">
defineProps({
  saveCode: {
    type: String,
    required: true,
  },
  saveName: {
    type: String,
    required: true,
  },

})

const emit = defineEmits<{
  (e: 'loadSave', value: string): void
}>()
</script>

<template>
  <div>
    {{ saveCode }}
    {{ saveName }}
  </div>
</template>
