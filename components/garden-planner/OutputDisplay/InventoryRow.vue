<script setup lang="ts">
import ItemDisplay from '~/components/garden-planner/HarvestCalculator/ItemDisplay.vue'
import useProcessor from '~/stores/useProcessor'
import { type ICropNameWithGrowthDiff, type IDayHarvest } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import type { PropType } from 'vue'
import { CropItem, type Item } from '~/assets/scripts/garden-planner/classes/items/item'
import ItemDisplayAlt from '../HarvestCalculator/ItemDisplayAlt.vue'
import { usePlannerDisplayConfig } from '~/stores/usePlannerDisplayConfig'

const props = defineProps({
  dayHarvest: {
    type: Object as PropType<IDayHarvest>,
    required: false
  },
  cropToFilterFor: {
    type: String
  }
})


const itemsFromHarvest = computed(() => {
  const items = [] as Item[]
  if (!props.dayHarvest)
    return []

  for (const [cropId, crop] of props.dayHarvest?.crops) {
    items.push(CropItem.fromCropYieldAndInfo(cropId, crop))
  }

  if (props.cropToFilterFor) {
    items.sort((a, b) => Number((b.name === props.cropToFilterFor)) - Number((a.name === props.cropToFilterFor)))
  }

  return items
})

const plannerDisplayConfig = usePlannerDisplayConfig()
// const totalGoldValue = computed(() => {

//   return itemsFromHarvest.value.reduce((acc, item) => {
//     return acc + item.totalGoldValue
//   }, 0)
// })
</script>

<template>
  <section class="pb-1">
    <p class="text-xs text-palia-blue-dark dark:text-primary font-semibold flex gap-2 items-center align-end">Day
      {{ dayHarvest?.day }}
      <!-- <span class="flex items-center align-middle gap-0.5">
        <img width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined"
          alt="Gold" format="webp">{{ totalGoldValue.toLocaleString() }}
      </span> -->
    </p>
    <ul
      class="flex w-full overflow-x-auto max-w-117 gap-1 p-1 scrollbar-h-2 bg-opacity-50 rounded-md bg-misc-dark/20  dark:bg-palia-blue-dark"
      :class="[plannerDisplayConfig.get === 'display+display' ? 'xl:max-w-138 ' : 'lg:max-w-130 xl:max-w-167 2xl:max-w-170']">
      <template v-for="item of itemsFromHarvest" :key="item.name">
        <ItemDisplayAlt class="border-misc border" v-if="item.count !== 0" :img-src="item.image" :img-alt="item.name" :star="item.isStar"
          :count="item.count" :base-gold-value="item.price" />
      </template>
    </ul>
  </section>
</template>
