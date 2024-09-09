<script setup lang="ts">
import ItemDisplay from './ItemDisplay.vue'
import type { IInventory } from '~/assets/scripts/garden-planner/utils/garden-helpers.ts'
import useHarvester from '~/stores/useHarvester'

const harvesterHandler = useHarvester()

const inventory = ref<IInventory | null>(null)

onMounted(() => {
  inventory.value = harvesterHandler.harvester.asInventory
})

watchEffect(() => {
  inventory.value = harvesterHandler.harvester.asInventory
})
</script>

<template>
  <section class="">
    <h2 class="text-sm font-semibold capitalize text-palia-blue-dark">
      Produce
    </h2>
    <ul class="flex flex-wrap gap-1 p-2 bg-opacity-50 rounded-md bg-misc min-h-16 gap-y-2">
      <template v-for="(group, index) in inventory" :key="index">
        <ItemDisplay
          v-for="(item, key) in group"
          :key="key"
          :img-src="item.img.src"
          :img-alt="item.img.alt"
          :star="item.isStar"
          :count="item.count"
          :base-gold-value="item.baseGoldValue"
        />
      </template>
    </ul>
  </section>
</template>
