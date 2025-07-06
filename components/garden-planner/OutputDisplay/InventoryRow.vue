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
</script>

<template>
  <section class="pb-1">
    <p class="text-xs text-palia-blue-dark dark:text-primary">Day {{ dayHarvest?.day }}</p>
    <ul
      class="flex w-full overflow-x-auto max-w-117 gap-1 p-1 bg-opacity-50 rounded-md bg-accent border border-misc-dark dark:border-water-retain/60 dark:bg-palia-blue-light"
      :class="[plannerDisplayConfig.get === 'display+display' ? 'xl:max-w-138 ' : 'lg:max-w-130 xl:max-w-167 2xl:max-w-170']"
      >
      <ItemDisplayAlt v-for="item of itemsFromHarvest" :key="item.name" :img-src="item.image" :img-alt="item.name"
        :star="item.isStar" :count="item.count" :base-gold-value="item.price" />
    </ul>
  </section>
</template>
