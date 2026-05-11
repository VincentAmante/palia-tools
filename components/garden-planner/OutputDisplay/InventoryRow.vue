<script setup lang="ts">
import ItemDisplay from '~/components/garden-planner/HarvestCalculator/ItemDisplay.vue'
import useProcessor from '~/stores/useProcessor'
import type { ICropNameWithGrowthDiff, IDayHarvest } from '~/assets/scripts/garden-planner/utils/garden-helpers'
import type { PropType } from 'vue'
import { CropItem, type Item } from '~/assets/scripts/garden-planner/classes/items/item'
import ItemDisplayAlt from '../HarvestCalculator/ItemDisplayAlt.vue'
import { usePlannerDisplayConfig } from '~/stores/usePlannerDisplayConfig'
import { Crop } from '~/assets/scripts/garden-planner/imports'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const harvester = useHarvester()
const processor = useProcessor()
const uiSettings = useUiSettings()

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
  const itemsAsCrops = [] as Item[]
  const itemsAsProduce = [] as Item[]
  let totalGold = 0
  let distributedTimeMinutes = 0

  if (!props.dayHarvest)
    return {
      items: [],
      totalGold: 0,
      distributedTimeMinutes: 0
    }

  // * time is included so we can improve performance if there was no processing done to begin with
  const willProcessItems = (uiSettings.settings.showAsProcessedItems && processor.processor.highestCraftingTime > 0)

  if (willProcessItems) {
    const itemsProcessed = processor.processor.processSingleDay(props.dayHarvest!, processor.settings, harvester.harvester.totalHarvest.cycleData)

    for (const [, item] of itemsProcessed.inventory) {
      const inventoryRowItem = CropItem.fromInventoryItem(item)
      itemsAsProduce.push(inventoryRowItem)
    }

    totalGold = itemsProcessed.stats.goldGenerated
    distributedTimeMinutes = itemsProcessed.stats.longestProcessMinutes
  } else {
    for (const [cropId, crop] of props.dayHarvest.crops) {
      itemsAsCrops.push(CropItem.fromCropYieldAndInfo(cropId, crop))
    }
  }

  // Prioritise filtered crop
  const itemsList = (willProcessItems ? itemsAsProduce : itemsAsCrops)
  if (props.cropToFilterFor) {
    itemsList.sort((a, b) => Number((b.name === props.cropToFilterFor)) - Number((a.name === props.cropToFilterFor)))
  }

  return {
    items: itemsList,
    totalGold,
    distributedTimeMinutes
  }
})

const plannerDisplayConfig = usePlannerDisplayConfig()
const totalGold = computed(() => {
  if (itemsFromHarvest.value.totalGold > 0) {
    return itemsFromHarvest.value.totalGold
  } else {
    return itemsFromHarvest.value.items.reduce((acc, item) => {
      return acc + item.totalGoldValue
    }, 0)
  }
})

// const estimatedTime = computed(() => {
//   return
// })
</script>

<template>
  <section class="pb-1">
    <p class="text-xs text-palia-blue-dark dark:text-primary font-semibold flex gap-2 items-center align-end">Day
      {{ dayHarvest?.day }}
      <span
      v-if="uiSettings.settings.showAsProcessedItems && uiSettings.settings.showAsProcessedGold && totalGold > 0"
        class="flex items-center align-middle gap-0.5">&mdash;
        <img
width="16" height="16" src="https://pgp-cdn.b-cdn.net/gold.webp" class="max-h-[1rem]" :srcset="undefined"
          alt="Gold" format="webp">{{ Math.round(totalGold).toLocaleString() }}
      </span>
      <span
      v-if="uiSettings.settings.showAsProcessedItems && uiSettings.settings.showAsProcessedTime && itemsFromHarvest.distributedTimeMinutes > 0"
        class="flex items-center align-middle gap-0.5">&mdash;
        <font-awesome-icon :icon="['fas', 'stopwatch']" />
        {{ formatMinutesToDaysHoursMinutes(itemsFromHarvest.distributedTimeMinutes) }}
      </span>
    </p>
    <div class="flex join">

      <ul
        class="flex w-full overflow-x-auto max-w-117 md:max-w-160 lg:max-w-180 gap-1 p-1 scrollbar-h-2 scrollbar-track-accent dark:scrollbar-track-palia-blue-secondary bg-opacity-50 rounded-md rounded-r-none bg-misc-dark/20  dark:bg-palia-blue-dark join-item"
        :class="[plannerDisplayConfig.get === 'display+display' ? 'xl:max-w-lg ' : 'xl:max-w-160']">
        <template v-for="item of itemsFromHarvest.items" :key="item.name">
          <ItemDisplayAlt
v-if="item.count !== 0" class="border-misc border" :img-src="item.image" :img-alt="item.name"
            :star="item.isStar" :count="item.count" :base-gold-value="item.price" />
        </template>
      </ul>
      <button
class="btn btn-lg right-0 btn-square bg-misc hover:bg-misc-dark border-misc dark:border-palia-blue dark:hover:bg-palia-blue dark:bg-palia-blue-light rounded-r-md"
        @click="$emit('dayClicked', dayHarvest?.day)">
        <FontAwesomeIcon class="text-sm" :icon="['fas', 'search']" />
      </button>
    </div>
  </section>
</template>
