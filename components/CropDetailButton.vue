<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTakingScreenshot } from '@/stores/useIsTakingScreenshot'
import { useDragAndDrop } from '@/stores/useDragAndDrop'
import { Bonus, Crop, CropType } from '@/assets/scripts/garden-planner/imports'
import { parseCropId } from '~/assets/scripts/garden-planner/utils/garden-helpers'

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
  cropId: {
    type: String,
    required: true,
  }
})

const { get: isTakingScreenshot } = storeToRefs(useTakingScreenshot())

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
  <button v-if="!(crop.type === CropType.None) && !(isTakingScreenshot && count === 0)" draggable="true"
    class="relative border rounded-xs btn btn-lg btn-square btn-secondary isolate border-misc"
    :class="(isSelected && !isTakingScreenshot) ? 'bg-white' : ''" :name="`select ${crop.type}`"
    @dragstart="(e: DragEvent) => dragHandler.startDrag(crop.type)" @dragend="(e: DragEvent) => dragHandler.stopDrag()"
    :aria-label="`Crop ${crop.type} ${count > 0 ? `, ${count}` : ''}`">
    <font-awesome-icon v-if="parseCropId(cropId).hasGrowthBoost"
      class="absolute bottom-0 right-0 p-1 text-xs leading-0 stroke-black text-growth-boost"
      :icon="['fas', 'forward-fast']" />
    <font-awesome-icon v-if="parseCropId(cropId).isStar"
      class="absolute bottom-0 left-0 p-1 text-xs leading-0 stroke-black  text-quality-increase-dark"
      :icon="['fas', 'star']" />
    <p v-if="count > 0"
      class="absolute top-0 right-0 pt-0.25 pr-0.5 text-xs leading-none font-bold text-palia-blue">
      {{ count }}
    </p>
    <img v-if="(crop && crop.image != null && crop.image !== '')" class="absolute -z-10 max-w-[26px] " draggable="false"
      :src="crop.cropImage" :class="(crop.type === crop.type) ? 'opacity-100' : 'opacity-90'" :alt="crop.type">
    <font-awesome-icon v-else class="absolute -z-10 max-w-[45px] text-warning text-3xl " :icon="['fas', 'eraser']" />
  </button>
</template>
