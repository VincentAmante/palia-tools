<script setup lang="ts">
import CrafterDisplayStats from './CrafterDisplayStats.vue'
import type { ICrafterData } from '~/assets/scripts/garden-planner/classes/Crafters/ProduceManager'
import type { CropType } from '@/assets/scripts/garden-planner/imports'
import { crops } from '@/assets/scripts/garden-planner/imports'
import { CropOption } from '@/assets/scripts/garden-planner/classes/Crafters/ProduceManager'

defineProps<{
  craftersData: ICrafterData[]
}>()

type CrafterType = ICrafterData['type']
function getCrafterImage(type: CrafterType) {
  switch (type) {
    case 'Seeder':
      return '/crafters/seeder.webp'
    case 'Jar':
      return '/crafters/preserve-jar.webp'
  }
}

function getCropImg(crop: CropType, cropOption: CropOption = CropOption.Crop) {
  // return crops[crop]?.image
  switch (cropOption) {
    case CropOption.Crop:
      return crops[crop]?.image
    case CropOption.Seed:
      return crops[crop]?.seedImage
    case CropOption.Preserve:
      return crops[crop]?.preserveImage
  }
}
</script>

<template>
  <section class="overflow-y-auto max-h-72 pb-3">
    <ul
      v-if="craftersData && craftersData.length > 0"
      class="grid text-misc gap-2 py-2 mb-2 max-w-full"
    >
      <li
        v-for="(crafter, index) in craftersData"
        :key="index"
        class="p-1 bg-secondary rounded-md flex w-max min-w-full"
      >
        <div class="flex flex-col items-center p-1">
          <nuxt-img
            :src="getCrafterImage(crafter.type)"
            :alt="crafter.type"
            width="48"
            height="48"
            class="inline-block"
          />

          <div
            class="aspect-square w-[48px] h-[48px] outline-misc bg-primary outline rounded-sm outline-1 relative flex items-center justify-center"
          >
            <nuxt-img
              v-if="crafter.dedicatedCrop"
              :src="getCropImg(crafter.dedicatedCrop.type, CropOption.Crop)"
              :alt="crafter.dedicatedCrop.type"
              width="64"
              height="64"
              class="w-8 h-8 object-contain"
            />
            <p
              v-if="crafter.dedicatedCrop?.isStarred"
              class="absolute left-0 bottom-0 p-1"
            >
              <font-awesome-icon
                class="text-quality-increase"
                :icon="['fas', 'star']"
              />
            </p>
          </div>
        </div>
        <div class="w-full h-full">
          <CrafterDisplayStats :crafter="crafter" />
        </div>
        <!-- <CrafterDisplayTimeline class="hidden" :crafter="crafter" /> -->
      </li>
    </ul>
    <div
      v-else
      class="flex flex-col items-center justify-center text-misc bg-accent py-6 rounded-md text-opacity-50 font-bold"
    >
      <p class=" font-bold">
        Add crafters to see data here
      </p>
    </div>
  </section>
</template>
