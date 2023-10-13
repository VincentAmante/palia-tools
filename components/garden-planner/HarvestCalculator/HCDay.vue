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

const yieldsTotal = computed(() => {
  return props.processedYields.result.length
})
const {
  currentPage,
  currentPageSize,
  pageCount,
  prev,
  next,
} = useOffsetPagination({
  total: yieldsTotal,
  page: 1,
  pageSize: 3,
})

const yieldsPage = computed(() => {
  return props.processedYields.result.slice((currentPage.value - 1) * currentPageSize.value, ((currentPage.value - 1) * currentPageSize.value) + currentPageSize.value)
})
const lastIndex = computed(() => {
  return ((currentPage.value - 1) * currentPageSize.value)
})

function getIndex(index: number) {
  return lastIndex.value + index
}

// gets a button for each page, with a maximum of 5 buttons
// if there are more than 5 pages, the buttons will be
// [1] ... [4] [5] [6] ... [10]
// with 5 being the current page
type PaginationButton = number | '...'
const paginationButtons = computed<PaginationButton[]>(() => {
  const buttons: PaginationButton[] = []
  const maxButtons = 5
  const maxPages = pageCount.value

  if (currentPage.value <= (maxButtons)) {
    for (let i = 1; i <= Math.min(maxPages, maxButtons); i++)
      buttons.push(i)
  }
  else {
    const firstButton = 1
    const lastButton = maxPages
    const beforeMiddleButton = currentPage.value - 1
    const middleButton = currentPage.value
    const afterMiddleButton = currentPage.value + 1

    buttons.push(firstButton)
    buttons.push('...')
    buttons.push(beforeMiddleButton)
    buttons.push(middleButton)
    buttons.push(afterMiddleButton)
    buttons.push('...')
    buttons.push(lastButton)
  }

  return buttons
})
</script>

<template>
  <div class="isolate overflow-hidden">
    <div class="grid gap-[2px]">
      <div class="overflow-hidden h-56 overflow-y-scroll pr-2 rounded-md rounded-b-none bg-accent">
        <table class="table px-4 bg-accent text-misc rounded-none">
          <tbody class="h-full">
            <th class="sr-only">
              <td>Harvest Day</td>
              <td>Gold</td>
            </th>
            <tr
              v-for="(harvest, index) of yieldsPage"
              :key="index"
              class="!border-b-0"
            >
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
                            v-if="crop.star.produce < 0"
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
                        v-if="(harvestData.harvests[getIndex(index)].seedsRemainder[cropType].star > 0)"
                        tooltip="Excess seeds for replanting"
                        :img-src="getCropImage(cropType, 'seed')"
                        :amount="harvestData.harvests[getIndex(index)].seedsRemainder[cropType].star"
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
                        v-if="(harvestData.harvests[getIndex(index)].seedsRemainder[cropType].base > 0)"
                        tooltip="Excess seeds for replanting"
                        :img-src="getCropImage(cropType, 'seed')"
                        :amount="harvestData.harvests[getIndex(index)].seedsRemainder[cropType].base"
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
                <p class="flex gap-1 font-bold items-center pr-1 justify-end">
                  <nuxt-img
                    format="webp"
                    src="/gold.webp"
                    class="max-h-[1.5rem]"
                    width="1rem"
                    height="1rem"
                    alt="Gold"
                    placeholder
                  />{{
                    harvest.totalGold.toLocaleString() }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bg-accent text-misc p-2 rounded-b-md flex items-center w-full justify-center gap-2">
        <button @click="prev">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </button>
        <template
          v-for="button of paginationButtons"
          :key="button"
        >
          <button
            v-if="button !== '...'"
            class="btn-sm btn btn-circle btn-accent" :class="[(currentPage === button ? 'bg-primary' : '')]"
            @click="currentPage = button"
          >
            {{ button }}
          </button>
          <p v-else>
            ...
          </p>
        </template>
        <button @click="next">
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </button>
      </div>
    </div>
  </div>
</template>
