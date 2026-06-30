<script setup lang="ts">
import ItemDisplay from './ItemDisplay.vue'
import useProcessor from '~/stores/useProcessor'

const processor = useProcessor()
</script>

<template>
  <section class="">
    <h2 class="text-sm font-semibold capitalize text-palia-blue-dark dark:text-accent">
      Produce
    </h2>
    <div
      class="flex flex-col bg-opacity-50 rounded-md bg-accent  border border-misc-dark dark:bg-palia-blue-light dark:border-palia-blue-dark">
      <ul class="flex flex-wrap gap-1 p-2 min-h-16 gap-y-2 ">
        <ItemDisplay
v-for="[name, item] in processor.inventory" :key="name" :img-src="item.img.src"
          :img-alt="item.img.alt" :star="item.isStar" :count="item.count" :base-gold-value="item.baseGoldValue" />
      </ul>
      <div
        v-if="(processor.settings.useFertilserCostSettings && (processor.totalProduceGold !== processor.finalGoldValue))"
        class="text-palia-blue p-2 pt-0 text-xs">
        <p class="flex items-center w-fit p-1 border border-misc dark:border-accent dark:text-accent rounded-sm"><span
            >Total:</span>
          <img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-4 inline pr-1"
            :srcset="undefined" alt="Gold" format="webp">
          <span class="font-bold">{{ (processor.totalProduceGold).toLocaleString() }}</span>
        </p>

      </div>
    </div>

  </section>
</template>
