<script setup lang="ts">
import ItemDisplay from './ItemDisplay.vue'
import type { IInventory, IInventoryItem } from '~/assets/scripts/garden-planner/utils/garden-helpers.ts'

const SAMPLE_INVENTORY = {
  crop: {
    'tomato-base': {
      count: 10,
      img: {
        src: '/crops/tomato.webp',
        alt: 'Tomato',
      },
      isStar: true,
      baseGoldValue: 23,
    } as IInventoryItem,
  } as Record<string, IInventoryItem>,
} as IInventory

const inventory = ref<IInventory | null>(SAMPLE_INVENTORY)
</script>

<template>
  <section class="p-2">
    <h2>Total Inventory</h2>
    <ul v-for="(group, index) in inventory" :key="index" class="flex flex-wrap p-2 rounded-md bg-misc">
      <ItemDisplay
        v-for="(item, key) in group"
        :key="key"
        :img-src="item.img.src"
        :img-alt="item.img.alt"
        :star="item.isStar"
        :count="item.count"
        :base-gold-value="item.baseGoldValue"
      />
    </ul>
  </section>
</template>
