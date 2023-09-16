<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTakingScreenshot } from '@/stores/useIsTakingScreenshot'
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
})

const { get: isTakingScreenshot } = storeToRefs(useTakingScreenshot())

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
</script>

<template>
  <div class="md:tooltip md:tooltip-right tooltip-accent" :data-tip="tooltip">
    <button
      v-if="!(fertiliser.type === FertiliserType.None && isTakingScreenshot)"
      class="relative btn btn-secondary btn-square btn-lg border-misc border-2 aspect-square flex flex-col items-center justify-center isolate"
      :class="(isSelected && !isTakingScreenshot) ? 'bg-white' : ''"
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
