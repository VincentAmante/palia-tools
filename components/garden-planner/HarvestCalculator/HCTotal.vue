<script setup lang="ts">
import CropDisplay from './CropDisplay.vue'
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
  <div class="flex flex-wrap gap-2 bg-accent p-1 rounded-md min-h-16 overflow-visible">
    <template v-for="(crop, cropType) of processedYields.totalResult.crops" :key="cropType">
      <CropDisplay
        v-if="(crop.star.produce !== 0)"
        :tooltip="getTooltipMessage(cropType, 'star', crop.star.produce, crop.star.gold)"
        :img-src="getCropImage(cropType, cropOptions[cropType].starType)"
        :amount="crop.star.produce"
        star
      />
      <CropDisplay
        v-if="(crop.star.cropRemainder > 0)"
        tooltip="Unsold crops for further processing"
        :img-src="crops[cropType]?.image"
        :amount="crop.star.cropRemainder"
        star
      >
        <template #icon>
          <font-awesome-icon class="text-success text-sm" :icon="['fas', 'recycle']" />
        </template>
      </CropDisplay>

      <CropDisplay
        v-if="(harvestData.harvestTotal.seedsRemainder[cropType].star > 0)"
        tooltip="Excess seeds for replanting"
        :img-src="getCropImage(cropType, 'seed')"
        :amount="harvestData.harvestTotal.seedsRemainder[cropType].star"
        star
      >
        <template #icon>
          <font-awesome-icon
            class="font-bold text-warning text-sm"
            :icon="['fas', 'turn-down']"
          />
        </template>
      </CropDisplay>

      <CropDisplay
        v-if="(crop.base.produce > 0)"
        :tooltip="getTooltipMessage(cropType, 'base', crop.base.produce, crop.base.gold)"
        :img-src="getCropImage(cropType, cropOptions[cropType].baseType)"
        :amount="crop.base.produce"
      />

      <CropDisplay
        v-if="(crop.base.cropRemainder > 0)"
        tooltip="Unsold crops for further processing"
        :img-src="crops[cropType]?.image"
        :amount="crop.base.cropRemainder"
      >
        <template #icon>
          <font-awesome-icon class="text-success text-sm" :icon="['fas', 'recycle']" />
        </template>
      </CropDisplay>

      <CropDisplay
        v-if="(harvestData.harvestTotal.seedsRemainder[cropType].base > 0)"
        tooltip="Excess seeds for replanting"
        :img-src="getCropImage(cropType, 'seed')"
        :amount="harvestData.harvestTotal.seedsRemainder[cropType].base"
      >
        <template #icon>
          <font-awesome-icon
            class="font-bold text-warning text-sm"
            :icon="['fas', 'turn-down']"
          />
        </template>
      </CropDisplay>
    </template>
  </div>
</template>
