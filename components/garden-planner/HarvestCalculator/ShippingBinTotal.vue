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
  <div class="flex flex-wrap p-1 pt-2 rounded-md bg-secondary">
    <template v-if="totalSales.length > 0">
      <template v-for="item in totalSales" :key="item.id">
        <CropDisplay
          :tooltip="`${item.name} ${item.type}: ${(item.count * item.price).toLocaleString()} Gold`"
          :img-src="item.image" :amount="item.count" :star="item.isStar"
        />
      </template>
    </template>
    <template v-else>
      <p class="items-center justify-center w-full py-2 font-bold text-center text-opacity-50 text-misc">
        No items in shipping bin
      </p>
    </template>
  </div>
</template>
