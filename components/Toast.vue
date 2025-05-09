<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { onMounted } from 'vue'

interface Props {
  message: string
  type: string
  duration: number
  id: string
}

const props = defineProps<Props>()

const emits = defineEmits(['close'])

const close = () => {
  emits('close')
}

onMounted(() => {
  setTimeout(() => {
    close()
  }, props.duration)
})

const icon = computed(() => {
  switch (props.type) {
    case 'alert-success':
      return ['fas', 'check']
    case 'alert-danger':
      return ['fas', 'exclamation-triangle']
    default:
      return ['fas', 'info-circle']
  }
})

</script>
<template>
  <div class="alert flex flex-row alert-soft relative" :class="type">
    <span class="flex gap-2 items-center">
      <FontAwesomeIcon :icon="icon" />
      {{ message }}
    </span>
    <button class="btn btn-ghost btn-circle btn-sm" @click="close">
      <FontAwesomeIcon :icon="['fas', 'x']" />
    </button>
  </div>
</template>