<script setup lang="ts">
import ItemDisplay from './ItemDisplay.vue'
import useProcessor from '~/stores/useProcessor'

const processor = useProcessor()
</script>

<template>
  <section class="">
    <h2 class="text-sm font-semibold capitalize text-palia-blue-dark">
      Produce
    </h2>
    <ul class="flex flex-wrap gap-1 p-2 bg-opacity-50 rounded-md bg-misc min-h-16 gap-y-2">
      <ItemDisplay
        v-for="[name, item] in processor.inventory"
        :key="name"
        :img-src="item.img.src"
        :img-alt="item.img.alt"
        :star="item.isStar"
        :count="item.count"
        :base-gold-value="item.baseGoldValue"
      />
    </ul>
  </section>
</template>
