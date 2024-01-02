<script setup lang="ts">
import CropDisplay from './CropDisplay.vue'
import type { IShippingBin } from '~/assets/scripts/garden-planner/classes/ShippingBin'

const props = defineProps<{
  shippingBin: IShippingBin
}>()

const totalSales = computed(() => {
  return Object.values(props.shippingBin.inventory)
})
</script>

<template>
  <div
    class="flex flex-wrap bg-secondary p-1 pt`-2 rounded-md"
  >
    <template
      v-for="item in totalSales"
      :key="item.id"
    >
      <CropDisplay
        :tooltip="`${item.name} ${item.type}: ${(item.count * item.price).toLocaleString()} Gold`"
        :img-src="item.image"
        :amount="item.count"
        :star="item.isStar"
      />
    </template>
  </div>
</template>
