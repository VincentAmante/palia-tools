<script setup lang="ts">
import CropDisplayAlt from './CropDisplayAlt.vue'
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
  <table class="table px-4 bg-accent text-misc">
    <tbody class="h-full">
      <tr v-for="(harvest, index) of processedYields.result" :key="index">
        <td class="flex gap-0 items-end flex-wrap w-full max-w-md py-2">
          <div class="flex flex-col w-full">
            <p class="font-semibold text-xs">
              Day {{ harvest.day }}
            </p>
            <div
              class="flex flex-wrap max-w-xl w-fit items-start justify-start gap-2"
            >
              <template v-for="(crop, cropType) of harvest.crops" :key="cropType">
                <!-- Star Produce -->
                <CropDisplayAlt
                  v-if="(crop.star.produce !== 0)"
                  :tooltip="getTooltipMessage(cropType, 'star', crop.star.produce, crop.star.gold)"
                  :img-src="getCropImage(cropType, cropOptions[cropType].starType)"
                  :amount="crop.star.produce"
                  star
                >
                  <template #icon>
                    <font-awesome-icon
                      class="text-error text-sm"
                      :icon="['fas', 'seedling']"
                    />
                  </template>
                </CropDisplayAlt>

                <!-- Star Crop Remainder for Processing -->
                <CropDisplayAlt
                  v-if="(crop.star.cropRemainder > 0)"
                  tooltip="Unsold crops for further processing"
                  :img-src="crops[cropType]?.image"
                  :amount="crop.star.cropRemainder"
                  star
                >
                  <template #icon>
                    <font-awesome-icon class="text-success text-sm" :icon="['fas', 'recycle']" />
                  </template>
                </CropDisplayAlt>

                <!-- Star Seed Remainder for Replanting -->
                <CropDisplayAlt
                  v-if="(harvestData.harvests[index].seedsRemainder[cropType].star > 0)"
                  tooltip="Excess seeds for replanting"
                  :img-src="getCropImage(cropType, 'seed')"
                  :amount="harvestData.harvests[index].seedsRemainder[cropType].star"
                  star
                >
                  <template #icon>
                    <font-awesome-icon
                      class="font-bold text-warning text-sm"
                      :icon="['fas', 'turn-down']"
                    />
                  </template>
                </CropDisplayAlt>

                <!-- Base Produce -->
                <CropDisplayAlt
                  v-if="(crop.base.produce !== 0)"
                  :tooltip="getTooltipMessage(cropType, 'base', crop.base.produce, crop.base.gold)"
                  :img-src="getCropImage(cropType, cropOptions[cropType].baseType)"
                  :amount="crop.base.produce"
                />

                <!-- Base Crop Remainder for Processing -->
                <CropDisplayAlt
                  v-if="(crop.base.cropRemainder > 0)"
                  tooltip="Unsold crops for further processing"
                  :img-src="crops[cropType]?.image"
                  :amount="crop.base.cropRemainder"
                >
                  <template #icon>
                    <font-awesome-icon class="text-success text-sm" :icon="['fas', 'recycle']" />
                  </template>
                </CropDisplayAlt>

                <!-- Base Seed Remainder for Replanting -->
                <CropDisplayAlt
                  v-if="(harvestData.harvests[index].seedsRemainder[cropType].base > 0)"
                  tooltip="Excess seeds for replanting"
                  :img-src="getCropImage(cropType, 'seed')"
                  :amount="harvestData.harvests[index].seedsRemainder[cropType].base"
                >
                  <template #icon>
                    <font-awesome-icon
                      class="font-bold text-warning text-sm"
                      :icon="['fas', 'turn-down']"
                    />
                  </template>
                </CropDisplayAlt>
              </template>
            </div>
          </div>
        </td>
        <td class="">
          <p class="flex gap-1 font-bold items-center pr-1">
            <nuxt-img
              format="webp" src="/gold.webp" class="max-h-[1.5rem]"
              width="1rem" height="1rem" alt="Gold"
            />{{
              harvest.totalGold.toLocaleString() }}
          </p>
        </td>
      </tr>
    </tbody>
  </table>
</template>
