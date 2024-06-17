<script setup lang="ts">
import ItemSelector from '~/components/garden-planner/ItemSelector.vue'
import { useSelectedItem } from '~/stores/useSelectedItem'

const selectedItem = useSelectedItem()
const display = ref<HTMLElement | null>(null)
</script>

<template>
  <div
    ref="display"
    class="lg:px-12"
  >
    <ItemSelector />
  </div>
</template>
