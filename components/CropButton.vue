<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTakingScreenshot } from '@/stores/useIsTakingScreenshot'
import { useDragAndDrop } from '@/stores/useDragAndDrop'
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
  <div
    v-if="!(crop.type === CropType.None) && !(isTakingScreenshot && count === 0)"
    class="md:tooltip md:tooltip-top tooltip-info"
    :data-tip="tooltip"
  >
    <button
      draggable="true"
      class="relative w-12 rounded-md btn-secondary border-misc border-[1px] aspect-square flex flex-col items-center justify-center isolate"
      :class="(isSelected && !isTakingScreenshot) ? 'bg-white' : ''"
      :name="`select ${crop.type}`"
      @dragstart="(e: DragEvent) => dragHandler.startDrag(crop.type)"
      @dragend="(e: DragEvent) => dragHandler.stopDrag()"
    >
      <font-awesome-icon
        v-if="bonus.icon !== ''"
        class="absolute top-0 left-0 p-1 text-xs leading-0 stroke-black" :icon="['fas', bonus.icon]" :class="bonus.colour"
      />
      <p class="absolute bottom-0 right-0 py-[0.2rem] pr-[0.2rem] text-xs leading-none font-bold text-neutral-700">
        {{ count }}
      </p>
      <nuxt-img
        v-if="(crop && crop.image != null && crop.image !== '')"
        v-once
        class="absolute -z-10 max-w-[34px]"
        draggable="false"
        :src="crop.image"
        :class="(crop.type === crop.type) ? 'opacity-100' : 'opacity-90'"
        :alt="crop.type"
        :srcset="undefined"
      />
      <font-awesome-icon
        v-else class="absolute -z-10 max-w-[45px] text-warning text-3xl "
        :icon="['fas', 'eraser']"
      />
    </button>
  </div>
</template>
