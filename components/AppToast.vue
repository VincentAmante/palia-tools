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

const INTERVAL = 10
const { remaining } = useCountdown(props.duration / INTERVAL, {
  immediate: true,
  interval: INTERVAL
})

const progressColor = computed(() => {
  switch (props.type) {
    case 'alert-success':
      return 'progress-primary'
    case 'alert-danger':
      return 'progress-error'
    case 'alert-info':
      return 'progress-info'
    default:
      return 'progress-primary'
  }
})

const useSoft = computed(() => {
  switch (props.type) {
    case 'alert-success':
      return false
    case 'alert-danger':
      return true
    default:
      return false
  }
})
</script>
<template>
  <div class="alert flex flex-row relative" :class="[type, useSoft ? 'alert-soft' : '']">
    <span class="flex gap-2 items-center">
      <FontAwesomeIcon :icon="icon" />
      {{ message }}
    </span>
    <button class="btn btn-ghost btn-circle btn-sm" @click="close">
      <FontAwesomeIcon :icon="['fas', 'x']" />
    </button>
    <progress
class="progress absolute bottom-0 w-full left-0 rounded-none" :class="progressColor" :value="remaining"
      :max="duration / INTERVAL"/>
  </div>
</template>