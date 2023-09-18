<script setup lang="ts">
import type { CropType, ICalculateValueResult, ISimulateYieldResult } from '@/assets/scripts/garden-planner/imports'

import { crops } from '@/assets/scripts/garden-planner/imports'

type ProduceOptions = 'crop' | 'seed' | 'preserve'

const props = defineProps({
  processedYields: {
    type: Object as PropType<ICalculateValueResult>,
    required: true,
  },
  harvestData: {
    type: Object as PropType<ISimulateYieldResult>,
    required: true,
  },
  cropOptions: {
    type: Object as PropType<Record<CropType, { baseType: ProduceOptions; starType: ProduceOptions }>>,
    required: true,
  },
})

function getCropImage(cropType: CropType, string: ProduceOptions) {
  if (crops && crops[cropType]) {
    // get preserve or seed image if chosen
    if (string === 'preserve')
      return crops[cropType]?.preserveImage

    else if (string === 'seed')
      return crops[cropType]?.seedImage

    else
      return crops[cropType]?.image
  }
}

function getTooltipMessage(cropType: CropType, type: 'star' | 'base', produceAmount: number, gold: number) {
  if (type === 'star' && produceAmount > 0)
    return `${(props.cropOptions[cropType].starType !== 'crop' ? `${props.cropOptions[cropType].starType}:` : '')} ${gold.toLocaleString()} Gold`
  else if (type === 'base' && produceAmount > 0)
    return `${(props.cropOptions[cropType].baseType !== 'crop' ? `${props.cropOptions[cropType].baseType}:` : '')} ${gold.toLocaleString()} Gold`
  else if (produceAmount < 0)
    return 'Crop was deducted for replanting'
  else
    return 'No produce'
}
</script>

<template>
  <div class="flex flex-wrap gap-1 bg-accent p-1 rounded-md min-h-12">
    <template v-for="(crop, cropType) of processedYields.totalResult.crops" :key="cropType">
      <div
        v-if="(crop.star.produce !== 0)" class="tooltip capitalize"
        :data-tip="getTooltipMessage(cropType, 'star', crop.star.produce, crop.star.gold)"
      >
        <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
          <nuxt-img
            :src="getCropImage(cropType, cropOptions[cropType].starType)"
            class="max-w-[2.25rem] object-contain aspect-square"
          />
          <p
            class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
          >
            {{ crop.star.produce }}
          </p>
          <p class="absolute bottom-0 left-0">
            <font-awesome-icon class="text-quality-increase text-sm" :icon="['fas', 'star']" />
          </p>
        </div>
      </div>
      <div
        v-if="(crop.star.cropRemainder > 0)" class="tooltip"
        data-tip="Unsold crops for further processing"
      >
        <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
          <nuxt-img
            :src="crops[cropType]?.image"
            class="max-w-[2.25rem] object-contain aspect-square"
          />
          <p
            class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
          >
            {{ crop.star.cropRemainder }}
          </p>
          <p class="absolute bottom-0 left-0">
            <font-awesome-icon class="text-quality-increase text-sm" :icon="['fas', 'star']" />
          </p>
          <p class="absolute top-0 right-0">
            <font-awesome-icon class="text-white text-sm" :icon="['fas', 'recycle']" />
          </p>
        </div>
      </div>
      <div
        v-if="(harvestData.harvestTotal.seedsRemainder[cropType].star > 0)"
        class="tooltip tooltip-right" data-tip="Excess seeds for replanting"
      >
        <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
          <nuxt-img
            :src="getCropImage(cropType, 'seed')"
            class="max-w-[2.25rem] object-contain aspect-square"
          />
          <p
            class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
          >
            {{ harvestData.harvestTotal.seedsRemainder[cropType].star }}
          </p>
          <p class="absolute bottom-0 left-0">
            <font-awesome-icon class="text-quality-increase text-sm" :icon="['fas', 'star']" />
          </p>
          <p class="absolute top-0 right-0">
            <font-awesome-icon
              class="font-bold text-white text-lg"
              :icon="['fas', 'turn-down']"
            />
          </p>
        </div>
      </div>
      <div
        v-if="(crop.base.produce > 0)" class="tooltip"
        :data-tip="getTooltipMessage(cropType, 'base', crop.base.produce, crop.base.gold)"
      >
        <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
          <nuxt-img
            :src="getCropImage(cropType, cropOptions[cropType].baseType)"
            class="max-w-[2.25rem] object-contain aspect-square"
          />
          <p
            class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
          >
            {{ crop.base.produce }}
          </p>
        </div>
      </div>
      <div
        v-if="(crop.base.cropRemainder > 0)" class="tooltip"
        data-tip="Unsold crops for further processing"
      >
        <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
          <nuxt-img
            :src="crops[cropType]?.image"
            class="max-w-[2.25rem] object-contain aspect-square"
          />
          <p
            class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
          >
            {{ crop.base.cropRemainder }}
          </p>
          <p class="absolute top-0 right-0">
            <font-awesome-icon class="text-white text-sm" :icon="['fas', 'recycle']" />
          </p>
        </div>
      </div>
      <div
        v-if="(harvestData.harvestTotal.seedsRemainder[cropType].base > 0)"
        class="tooltip tooltip-right" data-tip="Excess seeds for replanting"
      >
        <div class="relative h-full aspect-square p-1 flex flex-col items-center justify-center">
          <nuxt-img
            :src="getCropImage(cropType, 'seed')"
            class="max-w-[2.25rem] object-contain aspect-square"
          />
          <p
            class="absolute bottom-0 right-0 font-bold text-xs p-[1px] px-[2px] text-center align-middle rounded-full bg-base-200 bg-opacity-60"
          >
            {{ harvestData.harvestTotal.seedsRemainder[cropType].base }}
          </p>
          <p class="absolute top-0 right-0">
            <font-awesome-icon
              class="font-bold text-white text-lg"
              :icon="['fas', 'turn-down']"
            />
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
