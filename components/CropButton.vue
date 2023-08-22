<script setup lang="ts">
import { computed } from 'vue'
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
  inPictureMode: {
    type: Boolean,
    default: false,
  },
})

const tooltip = computed(() => {
  switch (props.crop.type) {
    case CropType.Tomato:
      return 'Tomato: Water Retention'
    case CropType.Potato:
      return 'Potato: Water Retention'
    case CropType.Rice:
      return 'Rice: Harvest Increase'
    case CropType.Wheat:
      return 'Wheat: Harvest Increase'
    case CropType.Onion:
      return 'Onion: Weed Prevention'
    case CropType.Carrot:
      return 'Carrot: Weed Prevention'
    case CropType.Cotton:
      return 'Cotton: Quality Increase'
    case CropType.Apple:
      return 'Apple Tree: Speed Increase. 3x3, needs 3 of a bonus for the buff to activate'
    case CropType.Blueberry:
      return 'Berry Bush: Speed Increase. 2x2, needs 2 of a bonus for the buff to activate'
    case CropType.None:
      return 'Remove Crop'
    default:
      return ''
  }
})

const bonus = computed(() => {
  switch (props.crop.cropBonus) {
    case Bonus.WaterRetain:
      return {
        icon: 'droplet',
        colour: 'text-sky-500',
      }
    case Bonus.QualityIncrease:
      return {
        icon: 'star',
        colour: 'text-yellow-600',
      }
    case Bonus.HarvestIncrease:
      return {
        icon: 'wheat-awn',
        colour: 'text-green-800',
      }
    case Bonus.WeedPrevention:
      return {
        icon: 'shield',
        colour: 'text-rose-500',
      }
    case Bonus.SpeedIncrease:
      return {
        icon: 'forward-fast',
        colour: 'text-orange-500',
      }
    default:
      return {
        icon: '',
        colour: 'text-gray-500',
      }
  }
})
</script>

<template>
  <div class="md:tooltip md:tooltip-right tooltip-accent" :data-tip="tooltip">
    <button
      v-if="!(crop.type === CropType.None && inPictureMode)"
      class="relative bg-base-200 rounded-lg btn-lg w-16 aspect-square flex flex-col items-center justify-center isolate hover:bg-slate-200"
      :class="(isSelected && !inPictureMode) ? 'bg-slate-100' : ''"
    >
      <font-awesome-icon
        v-if="bonus.icon != ''"
        class="absolute top-0 left-0 p-1 text-xs leading-0 stroke-black" :icon="['fas', bonus.icon]" :class="bonus.colour"
      />
      <div v-if="crop.type !== CropType.None" class="flex flex-col absolute bottom-0 right-0 py-[0.2rem] pr-[0.4rem]">
        <p class="text-sm leading-none font-bold text-neutral-700">
          {{ count }}
        </p>
      </div>
      <img
        v-if="(crop && crop.image != null && crop.image != '')" class="absolute -z-10 max-w-[45px]"
        :src="crop.image" :class="(crop.type === crop.type) ? 'opacity-100' : 'opacity-90'"
      >
      <font-awesome-icon
        v-else class="absolute -z-10 max-w-[45px] text-warning text-3xl "
        :icon="['fas', 'eraser']"
      />
    </button>
  </div>
</template>
