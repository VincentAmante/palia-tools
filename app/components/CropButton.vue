<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Bonus, Crop, CropType } from '@/assets/scripts/garden-planner/imports'

const props = defineProps({
  crop: {
    type: Crop || null,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const { get: isTakingScreenshot } = storeToRefs(useTakingScreenshot())
const tooltip = computed(() => {
  return props.crop.cropTooltip
})

const bonus = computed(() => {
  switch (props.crop.cropBonus) {
    case Bonus.WaterRetain:
      return {
        icon: 'droplet',
        colour: 'text-water-retain',
      }
    case Bonus.QualityIncrease:
      return {
        icon: 'star',
        colour: 'text-quality-increase',
      }
    case Bonus.HarvestIncrease:
      return {
        icon: 'wheat-awn',
        colour: 'text-harvest-boost',
      }
    case Bonus.WeedPrevention:
      return {
        icon: 'shield',
        colour: 'text-weed-prevention',
      }
    case Bonus.SpeedIncrease:
      return {
        icon: 'forward-fast',
        colour: 'text-growth-boost',
      }
    default:
      return {
        icon: '',
        colour: 'text-misc',
      }
  }
})

const dragHandler = useDragAndDrop()
</script>

<template>
  <button
    v-if="!(crop.type === CropType.None) && !(isTakingScreenshot && count === 0)"
    draggable="true" class="relative border rounded-xs btn btn-lg btn-square btn-secondary isolate border-misc dark:bg-palia-blue-secondary dark:hover:bg-palia-blue-secondary/20 dark:border-water-retain/60"
    :class="(isSelected && !isTakingScreenshot) ? 'bg-white dark:bg-water-retain/20' : ''" :name="`select ${crop.type}`"
    @dragstart="(e: DragEvent) => dragHandler.startDrag(crop.type)"
    @dragend="(e: DragEvent) => dragHandler.stopDrag()"
  >
    <font-awesome-icon
      v-if="bonus.icon !== ''" class="absolute top-0 left-0 p-1 text-xs leading-0 stroke-black"
      :icon="['fas', bonus.icon]" :class="bonus.colour"
    />
    <p v-if="count > 0" class="absolute bottom-0 right-0 py-[0.2rem] pr-[0.2rem] text-xs leading-none font-bold text-palia-blue dark:text-accent">
      {{ count }}
    </p>
    <img
      v-if="(crop && crop.image != null && crop.image !== '')"
      class="absolute -z-10 max-w-[28px] "
      draggable="false"
      :src="crop.cropImage"
      :class="(crop.type === crop.type) ? 'opacity-100' : 'opacity-90'"
      :alt="crop.type"
    >
    <font-awesome-icon v-else class="absolute -z-10 max-w-[45px] text-warning text-3xl " :icon="['fas', 'eraser']" />
  </button>
</template>
