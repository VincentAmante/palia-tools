<script setup lang="ts">
import { computed } from 'vue'
import { Bonus, Fertiliser, FertiliserType } from '@/assets/scripts/garden-planner/imports'

const props = defineProps({
  fertiliser: {
    type: Fertiliser || null || undefined,
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
  switch (props.fertiliser.type) {
    case FertiliserType.HydratePro:
      return 'HydratePro: Water Retention'
    case FertiliserType.QualityUp:
      return 'QualityUp: Quality Increase'
    case FertiliserType.HarvestBoost:
      return 'Harvest Boost: Harvest Increase'
    case FertiliserType.WeedBlock:
      return 'WeedBlocker: Weed Prevention'
    case FertiliserType.SpeedyGro:
      return 'SpeedyGro: Speed Increase'
    default:
      return ''
  }
})

const bonus = computed(() => {
  switch (props.fertiliser.effect) {
    case Bonus.WaterRetain:
      return {
        icon: 'droplet',
        colour: 'text-sky-500',
      }
    case Bonus.QualityIncrease:
      return {
        icon: 'star',
        colour: 'text-yellow-500',
      }
    case Bonus.HarvestIncrease:
      return {
        icon: 'wheat-awn',
        colour: 'text-green-500',
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
      v-if="!(fertiliser.type === FertiliserType.None && inPictureMode)"
      class="relative bg-base-200 rounded-lg btn-lg w-16 aspect-square flex flex-col items-center justify-center isolate hover:bg-slate-200"
      :class="(isSelected && !inPictureMode) ? 'bg-slate-100' : ''"
    >
      <font-awesome-icon
        v-if="bonus.icon !== ''"
        class="absolute top-0 left-0 p-1 text-xs leading-0 stroke-black" :icon="['fas', bonus.icon]" :class="bonus.colour"
      />
      <div v-if="fertiliser.type !== FertiliserType.None" class="flex flex-col absolute bottom-0 right-0 py-[0.2rem] pr-[0.4rem]">
        <p class="text-sm leading-none font-bold text-neutral-700">
          {{ count }}
        </p>
      </div>
      <nuxt-img
        v-if="(fertiliser && fertiliser.image != null && fertiliser.image !== '')" class="absolute -z-10 max-w-[45px]"
        :src="fertiliser.image" :class="(fertiliser.type === fertiliser.type) ? 'opacity-100' : 'opacity-90'"
      />
      <font-awesome-icon
        v-else class="absolute -z-10 max-w-[45px] text-warning text-3xl "
        :icon="['fas', 'eraser']"
      />
    </button>
  </div>
</template>
